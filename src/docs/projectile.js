/**
 * Projectile Motion Documentation
 */

export const projectileDocumentation = {
    overview: `Projectile motion is one of the most fundamental problems in classical mechanics. An object launched 
    into the air follows a parabolic trajectory under the influence of gravity. This demonstration explores how 
    launch angle, velocity, and air resistance affect the path of projectiles.`,

    mathematicalFoundation: {
        equations: [
            {
                formula: 'x(t) = v₀cos(θ)t',
                description: 'Horizontal position as a function of time (no air resistance)',
                variables: 'v₀ = initial velocity, θ = launch angle, t = time'
            },
            {
                formula: 'y(t) = v₀sin(θ)t - ½gt²',
                description: 'Vertical position as a function of time (no air resistance)',
                variables: 'g = gravitational acceleration (9.81 m/s²)'
            },
            {
                formula: 'R = (v₀²sin(2θ))/g',
                description: 'Maximum horizontal range (no air resistance)',
                variables: 'R = range'
            },
            {
                formula: 'h_max = (v₀²sin²(θ))/(2g)',
                description: 'Maximum height reached by projectile',
                variables: 'h_max = maximum height'
            },
            {
                formula: 't_flight = (2v₀sin(θ))/g',
                description: 'Total time of flight',
                variables: 't_flight = time from launch to landing'
            },
            {
                formula: 'θ_optimal = 45°',
                description: 'Optimal launch angle for maximum range (no air resistance)',
                variables: ''
            },
            {
                formula: 'F_drag = -kv²',
                description: 'Drag force proportional to velocity squared (quadratic drag)',
                variables: 'k = drag coefficient, v = velocity'
            },
            {
                formula: 'F_drag = -bv',
                description: 'Drag force proportional to velocity (linear drag, low speeds)',
                variables: 'b = drag coefficient'
            },
            {
                formula: 'y = x tan(θ) - (gx²)/(2v₀²cos²(θ))',
                description: 'Parabolic trajectory equation (no air resistance)',
                variables: 'x, y = coordinates'
            }
        ],
        concepts: [
            {
                name: 'Independence of Motions',
                description: `Horizontal and vertical motions are independent. Gravity only affects vertical motion, 
                so horizontal velocity remains constant (in the absence of air resistance). This principle allows 
                us to solve projectile problems by treating x and y components separately.`
            },
            {
                name: 'Parabolic Trajectory',
                description: `Without air resistance, projectiles follow perfect parabolas. The shape depends on 
                launch angle and velocity. At 45°, the range is maximized. At 90° (straight up), range is zero 
                but height is maximized.`
            },
            {
                name: 'Air Resistance',
                description: `Real projectiles experience drag forces that oppose motion. At low speeds, drag is 
                approximately linear (F = -bv). At higher speeds, quadratic drag (F = -kv²) dominates. Air 
                resistance reduces both range and maximum height, and makes the trajectory asymmetric.`
            },
            {
                name: 'Range Optimization',
                description: `Without air resistance, 45° gives maximum range. With air resistance, the optimal 
                angle is typically less than 45° because drag affects horizontal motion more at higher angles. 
                The exact optimal angle depends on the drag coefficient and initial velocity.`
            },
            {
                name: 'Energy Considerations',
                description: `At launch, the projectile has kinetic energy. As it rises, kinetic energy converts 
                to potential energy. At the peak, velocity is minimum (only horizontal component). With air 
                resistance, total energy decreases continuously due to drag work.`
            }
        ]
    },

    realWorldApplications: {
        engineering: [
            'Artillery and ballistics: Calculating trajectories for military applications',
            'Sports engineering: Optimizing launch angles for maximum distance in golf, javelin, shot put',
            'Aerospace: Rocket trajectories, re-entry vehicles, and satellite deployment',
            'Civil engineering: Water fountains, sprinkler systems, and drainage design',
            'Automotive: Understanding how objects are thrown from moving vehicles',
            'Packaging: Designing systems to launch or drop packages safely'
        ],
        physics: [
            'Classical mechanics: Fundamental example of two-dimensional motion',
            'Astrophysics: Trajectories of comets and asteroids',
            'Particle physics: Charged particles in electric and magnetic fields',
            'Fluid dynamics: Droplets and particles in air flows'
        ],
        examples: [
            'Basketball free throw: Players aim at optimal angle for highest success rate',
            'Golf drives: Professional golfers optimize launch angle and velocity',
            'Fireworks: Shells follow parabolic paths before exploding',
            'Water fountains: Water streams follow projectile trajectories',
            'Ski jumping: Athletes optimize their launch to maximize distance',
            'Throwing a ball: Different angles for different purposes (distance vs. height)',
            'Cannonballs: Historical warfare relied on understanding trajectories'
        ]
    },

    numericalMethods: {
        integration: [
            {
                name: 'Euler Integration',
                description: `Position and velocity are updated using Euler's method. With air resistance, 
                acceleration changes each timestep based on current velocity: a(t) = g - (k/m)v². Small timesteps 
                are needed for accuracy, especially with strong drag forces.`
            },
            {
                name: 'Runge-Kutta Methods',
                description: `For higher accuracy, especially with air resistance, RK4 provides better results than 
                Euler. RK4 evaluates the acceleration at multiple points within each timestep, giving more accurate 
                trajectory predictions.`
            },
            {
                name: 'Adaptive Timestepping',
                description: `When drag forces are large, adaptive timesteps can improve both accuracy and 
                efficiency. Smaller steps are used when acceleration changes rapidly (near launch, at peak), 
                larger steps when motion is more uniform.`
            }
        ],
        stability: `With air resistance, the equations of motion become coupled and nonlinear. Numerical integration 
        must handle the velocity-dependent drag force correctly. Stability requires timesteps small enough to capture 
        the fastest dynamics. For quadratic drag, the terminal velocity provides a natural timescale: Δt << v_term/g.`
    },

    furtherReading: [
        'Halliday, D., Resnick, R., & Walker, J. (2018). Fundamentals of Physics (11th ed.). Wiley.',
        'Taylor, J. R. (2005). Classical Mechanics. University Science Books.',
        'Fowles, G. R., & Cassiday, G. L. (2005). Analytical Mechanics (7th ed.). Brooks/Cole.',
        'Benson, T. (2021). "Projectile Motion." NASA Glenn Research Center.'
    ]
};

