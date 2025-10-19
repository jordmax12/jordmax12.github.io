// ============================================
// SCROLL-DRIVEN FLOW ANIMATION SYSTEM
// ============================================

class ScrollFlowSystem {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.nodes = config.nodes || [];
        this.scrollProgress = 0;
        this.container = null;
        this.isComplete = false;
        
        this.resize();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.width = rect.width;
        this.height = rect.height;
    }

    setScrollProgress(progress) {
        this.scrollProgress = Math.max(0, Math.min(1, progress));
        if (this.scrollProgress >= 1) {
            this.isComplete = true;
        }
        this.draw();
    }

    drawPath(fromNode, toNode, progress, color) {
        if (progress <= 0) return { x: 0, y: 0 };

        const ctx = this.ctx;
        const from = this.getNodePosition(fromNode);
        const to = this.getNodePosition(toNode);

        // Calculate the current end point based on progress
        const currentX = from.x + (to.x - from.x) * progress;
        const currentY = from.y + (to.y - from.y) * progress;

        // Draw the line with glow effect
        ctx.save();
        
        // Outer glow
        ctx.strokeStyle = color;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        // Middle glow
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        // Core line
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        ctx.restore();

        // Draw particle at the end of the line
        if (progress > 0.05) {
            this.drawParticle(currentX, currentY, color, progress);
        }

        return { x: currentX, y: currentY };
    }

    drawParticle(x, y, color, progress) {
        const ctx = this.ctx;
        const size = 5;
        const pulseSize = Math.sin(Date.now() / 200) * 2 + size;

        ctx.save();

        // Outer glow (largest)
        const outerGradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 6);
        outerGradient.addColorStop(0, color);
        outerGradient.addColorStop(0.3, color.replace('1)', '0.4)'));
        outerGradient.addColorStop(1, color.replace('1)', '0)'));
        
        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize * 6, 0, Math.PI * 2);
        ctx.fill();

        // Middle glow
        const middleGradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 3);
        middleGradient.addColorStop(0, color);
        middleGradient.addColorStop(0.5, color.replace('1)', '0.6)'));
        middleGradient.addColorStop(1, color.replace('1)', '0)'));
        
        ctx.fillStyle = middleGradient;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core particle with pulse
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright spot
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getNodePosition(nodeIndex) {
        if (!this.nodes[nodeIndex]) {
            return { x: 0, y: 0 };
        }

        const node = this.nodes[nodeIndex];
        return {
            x: (node.x / 100) * this.width,
            y: (node.y / 100) * this.height
        };
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.scrollProgress <= 0) return;

        const segments = this.config.segments || [];
        const totalSegments = segments.length;

        if (totalSegments === 0) return;

        // Calculate which segments should be drawn based on scroll progress
        const currentProgress = this.scrollProgress * totalSegments;

        segments.forEach((segment, index) => {
            const segmentProgress = Math.max(0, Math.min(1, currentProgress - index));
            
            if (segmentProgress > 0) {
                if (segment.split) {
                    // Handle split paths (fan-out)
                    segment.split.forEach(splitPath => {
                        this.drawPath(
                            segment.from,
                            splitPath.to,
                            segmentProgress,
                            splitPath.color || segment.color
                        );
                    });
                } else {
                    // Regular path
                    this.drawPath(
                        segment.from,
                        segment.to,
                        segmentProgress,
                        segment.color
                    );
                }
            }
        });
    }

    destroy() {
        // Cleanup if needed
    }
}

// ============================================
// SCROLL CONTROLLER
// ============================================

class ScrollFlowController {
    constructor() {
        this.flows = new Map();
        this.animationFrame = null;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.activeFlow = null;
        this.isLocked = false;
        this.accumulatedDelta = 0;
        this.scrollThreshold = 1000; // Total scroll distance to complete animation
        this.lastScrollDirection = 0; // Track scroll direction: 1 = down, -1 = up
        
        this.setupScrollListener();
        this.setupResizeHandler();
        
        console.log('ScrollFlowController initialized');
    }

    setupScrollListener() {
        let lastScrollY = window.scrollY;
        
        const handleWheel = (e) => {
            if (this.prefersReducedMotion) return;
            
            // Track scroll direction
            const currentDirection = e.deltaY > 0 ? 1 : -1;
            this.lastScrollDirection = currentDirection;
            
            // Check if we should activate a flow section
            this.checkForActiveFlow(e.deltaY);
            
            if (this.isLocked && this.activeFlow) {
                e.preventDefault();
                
                // Accumulate scroll delta
                this.accumulatedDelta += e.deltaY;
                
                // Calculate progress based on accumulated scroll
                const progress = Math.max(0, Math.min(1, this.accumulatedDelta / this.scrollThreshold));
                
                this.activeFlow.flow.setScrollProgress(progress);
                console.log(`Locked scroll progress: ${(progress * 100).toFixed(1)}%, delta: ${e.deltaY.toFixed(1)}`);
                
                // If scrolling up and progress is at 0, unlock and allow natural scroll up
                if (e.deltaY < 0 && progress <= 0) {
                    console.log('Scrolling up past start, unlocking scroll');
                    this.unlockScroll('up-complete');
                    return;
                }
                
                // If animation complete and scrolling down, unlock and allow scroll through
                if (progress >= 1 && e.deltaY > 0) {
                    console.log('Animation complete, unlocking scroll');
                    this.unlockScroll('down-complete');
                    
                    // Small scroll boost to continue past section
                    setTimeout(() => {
                        if (!this.isLocked) {
                            window.scrollBy({ top: 50, behavior: 'instant' });
                        }
                    }, 50);
                }
            }
        };
        
        const handleScroll = () => {
            lastScrollY = window.scrollY;
            
            if (!this.isLocked) {
                if (this.animationFrame) {
                    cancelAnimationFrame(this.animationFrame);
                }
                
                this.animationFrame = requestAnimationFrame(() => {
                    this.updateFlowsOnScroll();
                    this.animationFrame = null;
                });
            }
        };

        // Use wheel event with preventDefault for scroll locking
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial update
        setTimeout(() => {
            this.updateFlowsOnScroll();
        }, 100);
    }

    checkForActiveFlow(deltaY) {
        if (this.isLocked) return;
        
        const scrollingDown = deltaY > 0;
        
        // Check each flow to see if it should be activated
        this.flows.forEach((flow, flowId) => {
            const container = flow.container;
            if (!container) return;
            
            const rect = container.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Initialize flow state if needed
            if (flow.lockState === undefined) {
                flow.lockState = 'idle'; // 'idle', 'locked', 'completed'
            }
            
            // Define activation zone - more centered in viewport
            // Section needs to be well into view before locking
            const activationTop = windowHeight * 0.4; // Section top must be above 40% of viewport
            const activationBottom = windowHeight * 0.6; // Section bottom must be below 60% of viewport
            const inActivationZone = rect.top <= activationTop && rect.bottom >= activationBottom;
            
            // Reset state if section is far from viewport
            const isFarAbove = rect.bottom < -windowHeight * 0.5;
            const isFarBelow = rect.top > windowHeight * 1.5;
            
            if (isFarAbove || isFarBelow) {
                if (flow.lockState !== 'idle') {
                    console.log(`${flowId} - resetting to idle (far from viewport)`);
                    flow.lockState = 'idle';
                    flow.scrollProgress = 0;
                }
            }
            
            // Only lock if in activation zone AND state is idle
            const shouldLock = inActivationZone && flow.lockState === 'idle';
            
            if (shouldLock) {
                console.log(`Activating flow: ${flowId}, direction: ${scrollingDown ? 'down' : 'up'}, progress: ${(flow.scrollProgress * 100).toFixed(1)}%`);
                flow.lockState = 'locked';
                this.lockScroll(flowId, flow);
            }
        });
    }

    lockScroll(flowId, flow) {
        this.isLocked = true;
        this.activeFlow = { id: flowId, flow: flow };
        this.accumulatedDelta = flow.scrollProgress * this.scrollThreshold; // Resume from current progress
        console.log(`Scroll locked to ${flowId} at ${(flow.scrollProgress * 100).toFixed(1)}%`);
        
        // Show nodes immediately
        this.animateNodes(flow.container, true);
    }

    unlockScroll(reason) {
        console.log(`Unlocking scroll, reason: ${reason}`);
        
        // Set the flow state to 'completed' to prevent immediate re-locking
        if (this.activeFlow && this.activeFlow.flow) {
            this.activeFlow.flow.lockState = 'completed';
            console.log(`${this.activeFlow.id} - set to completed state`);
        }
        
        this.isLocked = false;
        this.activeFlow = null;
        this.accumulatedDelta = 0;
    }

    updateFlowsOnScroll() {
        this.flows.forEach((flow, flowId) => {
            const container = flow.container;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            const sectionTop = rect.top;
            const sectionBottom = rect.bottom;
            const sectionHeight = rect.height;
            
            // Make animation range MUCH larger for smooth scroll animation
            // Start when section is completely below viewport
            // End when section has scrolled well past center
            const triggerStart = windowHeight + sectionHeight; // Section completely below viewport
            const triggerEnd = -sectionHeight * 0.3; // Section mostly above viewport
            
            let progress = 0;

            // Calculate progress based on sectionTop position
            if (sectionTop < triggerStart && sectionTop > triggerEnd) {
                // Section is in animation range
                const totalDistance = triggerStart - triggerEnd;
                const distanceTraveled = triggerStart - sectionTop;
                progress = distanceTraveled / totalDistance;
                progress = Math.max(0, Math.min(1, progress));
            } else if (sectionTop <= triggerEnd) {
                // Section has passed animation range - complete
                progress = 1;
            }
            // else progress stays 0 (section below triggerStart)

            // Update node visibility
            if (progress > 0.05) {
                this.animateNodes(container, true);
            } else {
                this.animateNodes(container, false);
            }

            flow.setScrollProgress(progress);
            
            // Debug logging
            console.log(`${flowId} - sectionTop: ${sectionTop.toFixed(0)}, progress: ${(progress * 100).toFixed(1)}%`);
        });
    }

    animateNodes(container, fadeIn) {
        const nodes = container.querySelectorAll('.flow-node');
        nodes.forEach((node, index) => {
            setTimeout(() => {
                if (fadeIn) {
                    node.style.opacity = '1';
                    node.style.transform = 'translate(-50%, -50%) scale(1)';
                } else {
                    node.style.opacity = '0';
                    node.style.transform = 'translate(-50%, -50%) scale(0.9)';
                }
            }, index * 80);
        });
    }

    registerFlow(flowId, canvas, config) {
        const flow = new ScrollFlowSystem(canvas, config);
        const container = canvas.closest('.flow-visualization');
        
        if (container) {
            flow.container = container;
            container.dataset.flowId = flowId;
        }
        
        this.flows.set(flowId, flow);
        
        console.log(`Registered flow: ${flowId}`, config);
        
        return flow;
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.flows.forEach(flow => {
                    flow.resize();
                    flow.draw();
                });
                this.updateFlowsOnScroll();
            }, 250);
        });
    }

    destroy() {
        this.flows.forEach(flow => flow.destroy());
        this.flows.clear();
    }
}

// ============================================
// FLOW CONFIGURATIONS
// ============================================

function getKinesisFlowConfig() {
    return {
        nodes: [
            { x: 10, y: 50 },   // 0: Lambda
            { x: 28, y: 50 },   // 1: DynamoDB
            { x: 46, y: 50 },   // 2: Kinesis
            { x: 67, y: 30 },   // 3: Lambda Processor 1
            { x: 67, y: 70 }    // 4: Lambda Processor 2
        ],
        segments: [
            { from: 0, to: 1, color: 'rgba(255, 107, 53, 1)' },
            { from: 1, to: 2, color: 'rgba(124, 92, 255, 1)' },
            {
                from: 2,
                split: [
                    { to: 3, color: 'rgba(76, 201, 240, 1)' },
                    { to: 4, color: 'rgba(76, 201, 240, 1)' }
                ]
            }
        ]
    };
}

function getAppSyncFlowConfig() {
    return {
        nodes: [
            { x: 10, y: 50 },   // 0: Client
            { x: 32, y: 50 },   // 1: AppSync
            { x: 54, y: 50 },   // 2: Authorizer
            { x: 76, y: 50 }    // 3: API Lambda
        ],
        segments: [
            { from: 0, to: 1, color: 'rgba(255, 107, 53, 1)' },
            { from: 1, to: 2, color: 'rgba(245, 176, 65, 1)' },
            { from: 2, to: 3, color: 'rgba(124, 92, 255, 1)' }
        ]
    };
}

function getSQSSNSFlowConfig() {
    return {
        nodes: [
            { x: 15, y: 50 },   // 0: SNS
            { x: 40, y: 50 },   // 1: Fan-out point
            { x: 65, y: 30 },   // 2: SQS Queue 1
            { x: 65, y: 70 },   // 3: SQS Queue 2
            { x: 85, y: 30 },   // 4: Lambda 1
            { x: 85, y: 70 }    // 5: Lambda 2
        ],
        segments: [
            { from: 0, to: 1, color: 'rgba(255, 107, 53, 1)' },
            {
                from: 1,
                split: [
                    { to: 2, color: 'rgba(255, 153, 102, 1)' },
                    { to: 3, color: 'rgba(255, 153, 102, 1)' }
                ]
            },
            { from: 2, to: 4, color: 'rgba(124, 92, 255, 1)' },
            { from: 3, to: 5, color: 'rgba(124, 92, 255, 1)' }
        ]
    };
}

// ============================================
// INITIALIZATION
// ============================================

let flowController;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing flow animations...');
    
    // Initialize scroll flow controller
    flowController = new ScrollFlowController();

    // Register Kinesis flow
    const kinesisCanvas = document.getElementById('kinesis-flow-canvas');
    if (kinesisCanvas) {
        flowController.registerFlow('kinesis', kinesisCanvas, getKinesisFlowConfig());
        console.log('Kinesis flow registered');
    } else {
        console.warn('Kinesis canvas not found');
    }

    // Register AppSync flow
    const appsyncCanvas = document.getElementById('appsync-flow-canvas');
    if (appsyncCanvas) {
        flowController.registerFlow('appsync', appsyncCanvas, getAppSyncFlowConfig());
        console.log('AppSync flow registered');
    } else {
        console.warn('AppSync canvas not found');
    }

    // Register SQS/SNS flow
    const sqssnsCanvas = document.getElementById('sqssns-flow-canvas');
    if (sqssnsCanvas) {
        flowController.registerFlow('sqssns', sqssnsCanvas, getSQSSNSFlowConfig());
        console.log('SQS/SNS flow registered');
    } else {
        console.warn('SQS/SNS canvas not found');
    }

    // Keep existing step carousel functionality
    initStepCarousel();
});

// ============================================
// EXISTING STEP CAROUSEL
// ============================================

function initStepCarousel() {
    const steps = document.querySelectorAll('.device-step');
    const dots = document.querySelectorAll('.device-dot');
    let activeStep = 0;
    let intervalId = null;

    function activateStep(index) {
        steps.forEach((step, idx) => {
            const active = idx === index;
            step.classList.toggle('device-step--active', active);
        });
        dots.forEach((dot, idx) => {
            const active = idx === index;
            dot.classList.toggle('device-dot--active', active);
            dot.setAttribute('aria-selected', active);
        });
        activeStep = index;
    }

    function nextStep() {
        const next = (activeStep + 1) % steps.length;
        activateStep(next);
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            activateStep(idx);
            restartInterval();
        });
    });

    function restartInterval() {
        if (intervalId) {
            clearInterval(intervalId);
        }
        intervalId = setInterval(nextStep, 5000);
    }

    if (steps.length > 0) {
        activateStep(0);
        restartInterval();
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (flowController) {
        flowController.destroy();
    }
});
