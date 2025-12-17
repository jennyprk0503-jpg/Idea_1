/**
 * GESTURE CONTROLLER MODULE
 *
 * Uses MediaPipe Hands for webcam-based gesture recognition.
 * Detects:
 * - Left palm (open hand, palm facing camera) → rotate left
 * - Right palm (open hand, palm facing camera) → rotate right
 * - Right fist (closed hand) → interact/open chest
 *
 * Gestures are interpreted with smooth confidence thresholds to prevent twitchy behavior.
 */

export class GestureController {
    constructor(onStatusChange, onGestureDetected) {
        this.onStatusChange = onStatusChange;
        this.onGestureDetected = onGestureDetected;

        this.hands = null;
        this.camera = null;
        this.videoElement = document.getElementById('webcam');

        this.enabled = false;
        this.isRunning = false;

        // Gesture detection parameters - tuned for calm, non-twitchy feel
        this.gestureThreshold = 0.7; // Confidence threshold
        this.gestureDebounce = 300; // ms between gesture detections
        this.lastGestureTime = 0;

        // Current gesture state
        this.currentGesture = null;
    }

    /**
     * Initialize MediaPipe Hands
     */
    async init() {
        try {
            this.updateStatus('Initializing gesture recognition...');

            // Check if MediaPipe is available
            if (typeof Hands === 'undefined') {
                throw new Error('MediaPipe Hands not loaded');
            }

            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7
            });

            this.hands.onResults((results) => this.onHandsResults(results));

            this.updateStatus('Gesture recognition ready');
            return true;

        } catch (error) {
            console.error('Failed to initialize gesture controller:', error);
            this.updateStatus('Gesture recognition unavailable');
            return false;
        }
    }

    /**
     * Start gesture recognition (requires user interaction for webcam access)
     */
    async start() {
        if (this.isRunning) return;

        try {
            this.updateStatus('Requesting webcam access...');

            // Request webcam access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            this.videoElement.srcObject = stream;

            // Wait for video to be ready
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    resolve();
                };
            });

            await this.videoElement.play();

            // Initialize camera helper
            if (typeof Camera === 'undefined') {
                console.warn('MediaPipe Camera utils not available, using manual processing');
                this.startManualProcessing();
            } else {
                this.camera = new Camera(this.videoElement, {
                    onFrame: async () => {
                        if (this.enabled && this.hands) {
                            await this.hands.send({ image: this.videoElement });
                        }
                    },
                    width: 640,
                    height: 480
                });
                this.camera.start();
            }

            this.isRunning = true;
            this.enabled = true;
            this.updateStatus('Tracking hands');

        } catch (error) {
            console.error('Failed to start gesture recognition:', error);
            this.updateStatus('Webcam access denied');
        }
    }

    /**
     * Manual processing fallback if Camera utils unavailable
     */
    startManualProcessing() {
        const processFrame = async () => {
            if (this.enabled && this.hands && this.videoElement.readyState === 4) {
                await this.hands.send({ image: this.videoElement });
            }
            if (this.isRunning) {
                requestAnimationFrame(processFrame);
            }
        };
        processFrame();
    }

    /**
     * Stop gesture recognition
     */
    stop() {
        this.enabled = false;
        this.isRunning = false;

        if (this.camera) {
            this.camera.stop();
        }

        if (this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }

        this.updateStatus('Gesture recognition stopped');
    }

    /**
     * Enable/disable gesture recognition
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        this.updateStatus(enabled ? 'Tracking hands' : 'Gestures disabled');
    }

    /**
     * Process hand tracking results from MediaPipe
     */
    onHandsResults(results) {
        if (!this.enabled || !results.multiHandLandmarks) return;

        const now = Date.now();

        // Track gestures for both hands
        const detectedGestures = [];

        // Process each detected hand
        results.multiHandLandmarks.forEach((landmarks, index) => {
            const handedness = results.multiHandedness[index].label; // "Left" or "Right"
            const gesture = this.recognizeGesture(landmarks, handedness);

            if (gesture) {
                detectedGestures.push(gesture);
            }
        });

        // Check for both palms gesture (requires both hands showing palms)
        const leftPalm = detectedGestures.find(g => g.type === 'palm_left');
        const rightPalm = detectedGestures.find(g => g.type === 'palm_right');

        if (leftPalm && rightPalm && now - this.lastGestureTime >= this.gestureDebounce) {
            this.lastGestureTime = now;
            this.currentGesture = { type: 'both_palms', confidence: 0.9 };
            this.onGestureDetected(this.currentGesture);
        } else if (detectedGestures.length > 0 && now - this.lastGestureTime >= this.gestureDebounce) {
            // Send individual gestures
            detectedGestures.forEach(gesture => {
                this.lastGestureTime = now;
                this.currentGesture = gesture;
                this.onGestureDetected(gesture);
            });
        }

        // Update status with hand count
        const handCount = results.multiHandLandmarks.length;
        if (handCount > 0) {
            this.updateStatus(`Tracking ${handCount} hand${handCount > 1 ? 's' : ''}`);
        } else {
            this.updateStatus('No hands detected');
        }
    }

    /**
     * Recognize specific gestures from hand landmarks
     *
     * @param {Array} landmarks - MediaPipe hand landmarks
     * @param {string} handedness - "Left" or "Right"
     * @returns {Object|null} - Gesture object or null
     */
    recognizeGesture(landmarks, handedness) {
        // Check for pinch gesture first (higher priority)
        const isPinching = this.isPinching(landmarks);
        if (isPinching && handedness === 'Right') {
            return {
                type: 'pinch_right',
                hand: handedness,
                confidence: 0.9
            };
        }

        // Calculate if hand is open (palm) or closed (fist)
        const isOpen = this.isHandOpen(landmarks);
        const isFacing = this.isPalmFacingCamera(landmarks);
        const confidence = this.calculateGestureConfidence(landmarks, isOpen, isFacing);

        if (confidence < this.gestureThreshold) return null;

        // Palm gestures (hand open, facing camera)
        if (isOpen && isFacing) {
            return {
                type: handedness === 'Left' ? 'palm_left' : 'palm_right',
                hand: handedness,
                confidence: confidence
            };
        }

        return null;
    }

    /**
     * Determine if hand is open based on finger extension
     */
    isHandOpen(landmarks) {
        // Check if fingers are extended by comparing tip to knuckle distances
        const fingerTips = [8, 12, 16, 20]; // Index, middle, ring, pinky
        const fingerKnuckles = [5, 9, 13, 17];
        const wrist = landmarks[0];

        let extendedCount = 0;

        for (let i = 0; i < fingerTips.length; i++) {
            const tip = landmarks[fingerTips[i]];
            const knuckle = landmarks[fingerKnuckles[i]];

            const tipDistance = this.distance3D(tip, wrist);
            const knuckleDistance = this.distance3D(knuckle, wrist);

            // Finger is extended if tip is farther from wrist than knuckle
            if (tipDistance > knuckleDistance * 1.1) {
                extendedCount++;
            }
        }

        // Hand is open if at least 3 fingers are extended
        return extendedCount >= 3;
    }

    /**
     * Determine if palm is facing the camera
     */
    isPalmFacingCamera(landmarks) {
        // Use the normal vector of the palm to determine orientation
        const wrist = landmarks[0];
        const indexBase = landmarks[5];
        const pinkyBase = landmarks[17];

        // Calculate palm normal (simplified)
        const palmZ = (wrist.z + indexBase.z + pinkyBase.z) / 3;

        // If z-coordinate is close to 0, palm is facing camera
        return Math.abs(palmZ) < 0.1;
    }

    /**
     * Detect pinching gesture (thumb and middle finger touching)
     * Landmark indices: thumb tip = 4, middle finger tip = 12
     */
    isPinching(landmarks) {
        const thumbTip = landmarks[4];
        const middleFingerTip = landmarks[12];

        // Calculate 3D distance between thumb and middle finger tips
        const distance = this.distance3D(thumbTip, middleFingerTip);

        // Pinch threshold - fingers are considered pinching if very close
        const pinchThreshold = 0.05; // Adjust this value for sensitivity

        return distance < pinchThreshold;
    }

    /**
     * Calculate gesture confidence score
     */
    calculateGestureConfidence(landmarks, isOpen, isFacing) {
        let confidence = 0.5; // Base confidence

        if (isOpen) confidence += 0.3;
        if (isFacing) confidence += 0.2;

        // Bonus for hand stability (low jitter)
        const wrist = landmarks[0];
        if (this.lastWrist) {
            const movement = this.distance3D(wrist, this.lastWrist);
            if (movement < 0.05) {
                confidence += 0.2;
            }
        }
        this.lastWrist = wrist;

        return Math.min(confidence, 1.0);
    }

    /**
     * Calculate 3D distance between two points
     */
    distance3D(p1, p2) {
        return Math.sqrt(
            Math.pow(p1.x - p2.x, 2) +
            Math.pow(p1.y - p2.y, 2) +
            Math.pow(p1.z - p2.z, 2)
        );
    }

    /**
     * Update status message
     */
    updateStatus(message) {
        if (this.onStatusChange) {
            this.onStatusChange(message);
        }
    }
}
