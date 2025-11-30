/**
 * Orbital Mechanics Documentation
 */

export const orbitalDocumentation = {
    overview: `Orbital mechanics describes the motion of objects under the influence of gravitational forces. 
    From satellites orbiting Earth to planets around the Sun, these systems follow Kepler's laws and conservation 
    principles. Understanding orbital dynamics is essential for space missions, satellite deployment, and 
    astrophysics.`,

    mathematicalFoundation: {
        equations: [
            {
                formula: 'F = G(m₁m₂)/r²',
                description: 'Newton\'s law of universal gravitation',
                variables: 'G = 6.674×10⁻¹¹ N⋅m²/kg², m = mass, r = distance'
            },
            {
                formula: 'a = GM/r²',
                description: 'Gravitational acceleration',
                variables: 'M = central mass, a = acceleration'
            },
            {
                formula: 'v = √(GM/r)',
                description: 'Circular orbital velocity',
                variables: 'v = orbital speed'
            },
            {
                formula: 'v_esc = √(2GM/r)',
                description: 'Escape velocity: minimum speed to escape gravitational field',
                variables: 'v_esc = escape velocity'
            },
            {
                formula: 'E = ½mv² - GMm/r',
                description: 'Total orbital energy (kinetic + potential)',
                variables: 'E < 0 (bound), E = 0 (parabolic), E > 0 (hyperbolic)'
            },
            {
                formula: 'T² = (4π²/GM)a³',
                description: 'Kepler\'s third law: period squared proportional to semi-major axis cubed',
                variables: 'T = orbital period, a = semi-major axis'
            },
            {
                formula: 'r = a(1 - e²)/(1 + e cos(θ))',
                description: 'Polar equation of elliptical orbit',
                variables: 'e = eccentricity (0 = circle, <1 = ellipse, 1 = parabola, >1 = hyperbola), θ = true anomaly'
            },
            {
                formula: 'L = mvr = constant',
                description: 'Conservation of angular momentum',
                variables: 'L = angular momentum'
            },
            {
                formula: 'v_peri = √(GM(1+e)/a(1-e))',
                description: 'Velocity at periapsis (closest approach)',
                variables: ''
            },
            {
                formula: 'v_apo = √(GM(1-e)/a(1+e))',
                description: 'Velocity at apoapsis (farthest point)',
                variables: ''
            },
            {
                formula: 'Δv = v₂ - v₁',
                description: 'Velocity change required for orbital maneuvers',
                variables: 'Δv = delta-v, crucial for mission planning'
            }
        ],
        concepts: [
            {
                name: 'Kepler\'s Laws',
                description: `Three fundamental laws describing planetary motion: (1) Orbits are ellipses with the 
                central body at one focus, (2) Equal areas are swept in equal times (angular momentum conservation), 
                (3) Period squared is proportional to semi-major axis cubed. These laws apply to all bound orbits.`
            },
            {
                name: 'Orbital Energy',
                description: `Total energy determines orbit type: negative (bound elliptical/circular), zero 
                (parabolic escape), positive (hyperbolic escape). Energy is conserved in two-body systems. The 
                more negative the energy, the more tightly bound the orbit.`
            },
            {
                name: 'Angular Momentum Conservation',
                description: `In central force motion, angular momentum is conserved. This causes objects to 
                move faster when closer to the central body (perihelion) and slower when farther (aphelion). This 
                is Kepler's second law.`
            },
            {
                name: 'Eccentricity',
                description: `Eccentricity (e) measures orbit shape: 0 = circle, 0<e<1 = ellipse, e=1 = parabola, 
                e>1 = hyperbola. Most planetary orbits are nearly circular (e << 1). Comets have highly elliptical 
                orbits (e ≈ 0.9).`
            },
            {
                name: 'Hohmann Transfer',
                description: `The most fuel-efficient way to transfer between circular orbits uses an elliptical 
                transfer orbit tangent to both. This requires two velocity changes (burns) - one to enter the 
                transfer orbit, one to circularize at the destination.`
            },
            {
                name: 'Lagrange Points',
                description: `Five special points where gravitational forces balance, allowing objects to maintain 
                stable positions relative to two massive bodies. L1-L3 are unstable, L4-L5 are stable. Used for 
                space telescopes and solar observation missions.`
            },
            {
                name: 'Three-Body Problem',
                description: `Unlike the two-body problem (solved exactly), three-body systems are generally 
                chaotic. However, restricted three-body problems (one mass much smaller) have stable solutions 
                at Lagrange points.`
            }
        ]
    },

    realWorldApplications: {
        engineering: [
            'Satellite deployment: Placing satellites in specific orbits for communication, GPS, weather monitoring',
            'Space mission planning: Calculating trajectories for interplanetary missions',
            'Space station operations: Maintaining orbits and avoiding debris',
            'GPS systems: Precise orbital calculations essential for accurate positioning',
            'Space debris tracking: Predicting collision risks and managing space traffic',
            'Asteroid deflection: Understanding orbital mechanics for planetary defense',
            'Space elevator: Theoretical structure requiring precise orbital mechanics'
        ],
        physics: [
            'Astrophysics: Understanding planetary formation and evolution',
            'General relativity: Testing gravitational theories with orbital precession',
            'Gravitational waves: Binary systems emit gravitational radiation',
            'Dark matter: Orbital velocities reveal invisible mass distributions',
            'Exoplanet detection: Orbital dynamics reveal planetary systems',
            'Black hole physics: Orbits near event horizons test general relativity'
        ],
        examples: [
            'Moon orbiting Earth: Demonstrates elliptical orbit with Earth at one focus',
            'International Space Station: Maintains low Earth orbit at ~400 km altitude',
            'GPS satellites: Network of satellites in medium Earth orbit',
            'Geostationary satellites: Orbit matches Earth\'s rotation, staying fixed above one point',
            'Comets: Highly elliptical orbits bringing them close to the Sun',
            'Planetary motion: All planets follow elliptical orbits around the Sun',
            'Asteroid impacts: Understanding orbits helps predict potential collisions',
            'Space missions: Mars rovers, Voyager probes, New Horizons all use orbital mechanics'
        ]
    },

    numericalMethods: {
        integration: [
            {
                name: 'Euler Integration',
                description: `Simple but can accumulate errors over long timescales. For orbital simulations, 
                energy and angular momentum drift can cause orbits to spiral or escape. Not recommended for 
                long-term simulations.`
            },
            {
                name: 'Runge-Kutta 4th Order',
                description: `Better accuracy than Euler. RK4 is commonly used for orbital mechanics simulations. 
                However, it doesn't preserve energy exactly, so orbits may still drift over many periods.`
            },
            {
                name: 'Symplectic Integrators',
                description: `Essential for long-term orbital simulations. Symplectic methods preserve the 
                Hamiltonian structure, maintaining energy and angular momentum conservation. The leapfrog method 
                is a simple symplectic integrator ideal for orbital mechanics.`
            },
            {
                name: 'Adaptive Timestepping',
                description: `Orbits have varying timescales - fast near periapsis, slow near apoapsis. Adaptive 
                timesteps improve both accuracy and efficiency. Smaller steps during close approaches, larger 
                steps during distant portions.`
            }
        ],
        stability: `Orbital simulations require careful attention to numerical stability. Energy conservation is 
        critical - even small energy drift can cause orbits to spiral inward or escape. Symplectic integrators 
        are essential for long-term stability. Timesteps should be much smaller than the orbital period: 
        Δt << T = 2π√(a³/GM). For highly elliptical orbits, adaptive timestepping is recommended.`
    },

    furtherReading: [
        'Curtis, H. D. (2013). Orbital Mechanics for Engineering Students (3rd ed.). Butterworth-Heinemann.',
        'Bate, R. R., Mueller, D. D., & White, J. E. (1971). Fundamentals of Astrodynamics. Dover Publications.',
        'Vallado, D. A., & McClain, W. D. (2013). Fundamentals of Astrodynamics and Applications (4th ed.). Microcosm Press.',
        'Goldstein, H., Poole, C., & Safko, J. (2001). Classical Mechanics (3rd ed.). Addison-Wesley.',
        'Murray, C. D., & Dermott, S. F. (1999). Solar System Dynamics. Cambridge University Press.'
    ]
};

