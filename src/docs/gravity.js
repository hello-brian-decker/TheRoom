/**
 * Gravity Documentation - Comprehensive Guide to Gravitational Physics
 */

export const gravityDocumentation = {
    overview: `Gravity is one of the four fundamental forces of nature, governing the motion of celestial bodies, 
    the structure of galaxies, and the behavior of objects on Earth. From Newton's universal law of gravitation to 
    Einstein's general relativity, our understanding of gravity has evolved to explain phenomena from falling apples 
    to black holes and gravitational waves. This comprehensive guide covers the mathematical foundations, key concepts, 
    and real-world applications of gravitational physics.`,

    mathematicalFoundation: {
        equations: [
            {
                formula: 'F = G(m₁m₂)/r²',
                description: 'Newton\'s Law of Universal Gravitation - the fundamental equation describing gravitational force between two masses',
                variables: 'F = gravitational force (N), G = 6.674×10⁻¹¹ N⋅m²/kg² (gravitational constant), m₁, m₂ = masses (kg), r = distance between centers (m)'
            },
            {
                formula: 'g = GM/r²',
                description: 'Gravitational field strength (acceleration due to gravity)',
                variables: 'g = gravitational acceleration (m/s²), M = mass creating the field (kg), r = distance from center (m)'
            },
            {
                formula: 'V = -GM/r',
                description: 'Gravitational potential energy (per unit mass)',
                variables: 'V = gravitational potential (J/kg), negative because gravity is attractive'
            },
            {
                formula: 'E = ½mv² - GMm/r',
                description: 'Total orbital energy (kinetic + potential)',
                variables: 'E < 0 (bound orbit), E = 0 (parabolic escape), E > 0 (hyperbolic escape)'
            },
            {
                formula: 'v_orbital = √(GM/r)',
                description: 'Circular orbital velocity - speed needed for stable circular orbit',
                variables: 'v = orbital velocity (m/s), M = central mass (kg), r = orbital radius (m)'
            },
            {
                formula: 'v_escape = √(2GM/r)',
                description: 'Escape velocity - minimum speed to escape gravitational field',
                variables: 'v_escape = escape velocity (m/s), approximately 11.2 km/s for Earth'
            },
            {
                formula: 'T² = (4π²/GM)a³',
                description: 'Kepler\'s Third Law - orbital period squared is proportional to semi-major axis cubed',
                variables: 'T = orbital period (s), a = semi-major axis (m), M = central mass (kg)'
            },
            {
                formula: 'r = a(1 - e²)/(1 + e cos(θ))',
                description: 'Polar equation of elliptical orbit',
                variables: 'e = eccentricity (0=circle, <1=ellipse, 1=parabola, >1=hyperbola), θ = true anomaly, a = semi-major axis'
            },
            {
                formula: 'F_tidal = (2GMmR)/r³',
                description: 'Tidal force - difference in gravitational force across an object',
                variables: 'R = radius of object experiencing tides, r = distance to massive body, causes ocean tides and tidal locking'
            },
            {
                formula: 'g_surface = GM/R²',
                description: 'Surface gravity of a planet or star',
                variables: 'R = radius of the body, determines weight of objects on surface'
            },
            {
                formula: 'L = mvr = m√(GMr)',
                description: 'Angular momentum in circular orbit (conserved)',
                variables: 'L = angular momentum (kg⋅m²/s), conserved in absence of external torques'
            },
            {
                formula: 'a = G(M₁ + M₂)/r²',
                description: 'Relative acceleration in two-body system',
                variables: 'Accounts for motion of both bodies, not just one'
            },
            {
                formula: 'v_peri = √(GM(1+e)/a(1-e))',
                description: 'Velocity at periapsis (closest point in elliptical orbit)',
                variables: 'Fastest point in orbit, maximum kinetic energy'
            },
            {
                formula: 'v_apo = √(GM(1-e)/a(1+e))',
                description: 'Velocity at apoapsis (farthest point in elliptical orbit)',
                variables: 'Slowest point in orbit, minimum kinetic energy'
            },
            {
                formula: 'ΔΦ = -4πGρ',
                description: 'Poisson\'s equation for gravitational potential (general form)',
                variables: 'Φ = gravitational potential, ρ = mass density, relates mass distribution to gravitational field'
            },
            {
                formula: 'g = -∇Φ',
                description: 'Gravitational field as gradient of potential',
                variables: 'Field points in direction of steepest potential decrease (toward masses)'
            },
            {
                formula: 'τ_precession = (6πGM)/(c²a(1-e²))',
                description: 'General relativistic precession of perihelion (Mercury\'s orbit)',
                variables: 'c = speed of light, explains 43 arcseconds per century precession'
            },
            {
                formula: 'r_schwarzschild = 2GM/c²',
                description: 'Schwarzschild radius (event horizon of black hole)',
                variables: 'Radius where escape velocity equals speed of light, ~9mm for Earth mass'
            }
        ],
        concepts: [
            {
                name: 'Newton\'s Law of Universal Gravitation',
                description: `Every particle attracts every other particle with a force proportional to the product 
                of their masses and inversely proportional to the square of the distance between them. This law 
                explains planetary motion, tides, and the behavior of satellites. The gravitational constant G was 
                first measured by Henry Cavendish in 1798 using a torsion balance.`
            },
            {
                name: 'Gravitational Field',
                description: `A region of space where a mass experiences a gravitational force. The field strength 
                (g) at any point equals the force per unit mass. Fields are vector quantities pointing toward 
                the source mass. The field concept allows us to describe gravity without direct contact between objects.`
            },
            {
                name: 'Gravitational Potential Energy',
                description: `The energy stored in a gravitational field. For two masses, U = -GMm/r. The negative 
                sign indicates bound systems have negative total energy. Potential energy increases (becomes less 
                negative) as objects move apart. Zero potential is defined at infinite separation.`
            },
            {
                name: 'Kepler\'s Laws of Planetary Motion',
                description: `Three empirical laws discovered by Johannes Kepler: (1) Planets orbit in ellipses with 
                the Sun at one focus, (2) A line connecting planet and Sun sweeps equal areas in equal times 
                (angular momentum conservation), (3) The square of the orbital period is proportional to the cube 
                of the semi-major axis. These laws apply to all bound orbits and were later explained by Newton's 
                gravitation theory.`
            },
            {
                name: 'Escape Velocity',
                description: `The minimum speed an object needs to escape a gravitational field without additional 
                propulsion. At escape velocity, total energy equals zero (parabolic trajectory). For Earth, this 
                is approximately 11.2 km/s. Objects with speeds less than escape velocity follow bound orbits 
                (elliptical or circular).`
            },
            {
                name: 'Tidal Forces',
                description: `The difference in gravitational force across an extended object. Tidal forces cause 
                ocean tides on Earth (Moon and Sun), tidal locking (Moon always shows same face), and can tear 
                apart objects that get too close to massive bodies (Roche limit). The force is proportional to 
                1/r³, making it more sensitive to distance than regular gravity (1/r²).`
            },
            {
                name: 'Orbital Mechanics',
                description: `The study of motion under gravitational influence. Key principles include conservation 
                of energy and angular momentum. Orbits are conic sections: circles (e=0), ellipses (0<e<1), 
                parabolas (e=1), or hyperbolas (e>1). Most planetary orbits are nearly circular ellipses.`
            },
            {
                name: 'N-Body Problem',
                description: `The problem of predicting motion of N bodies under mutual gravitational attraction. 
                The two-body problem has exact solutions (Kepler orbits). Three or more bodies generally require 
                numerical integration and can exhibit chaotic behavior. The solar system is a complex N-body system 
                with many interactions.`
            },
            {
                name: 'General Relativity',
                description: `Einstein's theory describing gravity as curvature of spacetime caused by mass and 
                energy. General relativity explains phenomena Newtonian gravity cannot: Mercury's orbit precession, 
                gravitational lensing, time dilation near massive objects, and gravitational waves. For weak 
                fields and low speeds, it reduces to Newtonian gravity.`
            },
            {
                name: 'Gravitational Waves',
                description: `Ripples in spacetime propagating at light speed, predicted by general relativity and 
                detected in 2015. Produced by accelerating masses, particularly binary systems (black holes, 
                neutron stars). LIGO and Virgo detectors measure tiny spacetime distortions (10⁻²¹ strain).`
            },
            {
                name: 'Dark Matter',
                description: `Invisible matter inferred from gravitational effects - galaxy rotation curves, 
                gravitational lensing, and cosmic structure formation. Comprises ~27% of universe's mass-energy. 
                Does not interact electromagnetically, only gravitationally. Nature remains one of physics' 
                greatest mysteries.`
            },
            {
                name: 'Black Holes',
                description: `Regions where gravity is so strong that nothing, not even light, can escape. Formed 
                when massive stars collapse. Event horizon marks the point of no return (Schwarzschild radius). 
                Supermassive black holes exist at galaxy centers. Recent observations include direct imaging of 
                M87* and Sagittarius A*.`
            }
        ]
    },

    realWorldApplications: {
        engineering: [
            'Space mission planning: Calculating trajectories for satellites, Mars rovers, and interplanetary probes',
            'Satellite deployment: Placing communication, GPS, and weather satellites in specific orbits',
            'Space station operations: Maintaining International Space Station orbit and avoiding space debris',
            'GPS systems: Relativistic corrections essential for accurate positioning (time dilation effects)',
            'Space elevator: Theoretical structure requiring precise understanding of orbital mechanics',
            'Asteroid deflection: Planetary defense missions using gravitational assists and kinetic impactors',
            'Space debris management: Predicting collisions and managing space traffic using orbital mechanics',
            'Gravitational slingshot: Using planetary flybys to change spacecraft trajectories efficiently',
            'Geostationary satellites: Positioning satellites to match Earth\'s rotation for fixed coverage',
            'Lunar missions: Calculating trajectories for Moon landings and return trips'
        ],
        physics: [
            'Astrophysics: Understanding stellar evolution, planetary formation, and galaxy dynamics',
            'Cosmology: Explaining large-scale structure formation and cosmic microwave background',
            'General relativity tests: Measuring orbit precession, gravitational redshift, and frame dragging',
            'Gravitational wave astronomy: Detecting and studying black hole mergers and neutron star collisions',
            'Dark matter research: Mapping invisible matter through gravitational lensing and rotation curves',
            'Exoplanet detection: Discovering planets through radial velocity and transit methods',
            'Black hole physics: Studying event horizons, accretion disks, and Hawking radiation',
            'Gravitational lensing: Using massive objects as cosmic telescopes to observe distant galaxies',
            'Pulsar timing: Using precise pulsar measurements to detect gravitational waves',
            'Cosmic structure: Understanding how gravity shapes galaxies, clusters, and cosmic web'
        ],
        examples: [
            'Earth-Moon system: Demonstrates elliptical orbits, tidal locking, and orbital decay',
            'Solar system: All planets follow elliptical orbits with Sun at one focus (Kepler\'s 1st law)',
            'Ocean tides: Caused by gravitational differences from Moon and Sun across Earth\'s diameter',
            'Satellite orbits: GPS satellites in medium Earth orbit, geostationary satellites at 35,786 km',
            'Comets: Highly elliptical orbits bringing them close to Sun, demonstrating Kepler\'s laws',
            'Binary star systems: Two stars orbiting common center of mass, emitting gravitational waves',
            'Galaxy rotation: Stars orbit galactic center, revealing dark matter through velocity curves',
            'Gravitational slingshot: Voyager probes used Jupiter and Saturn to reach outer planets',
            'International Space Station: Maintains orbit at ~400 km, experiences slight orbital decay',
            'Black hole mergers: LIGO detected gravitational waves from colliding black holes billions of light-years away',
            'Planetary rings: Saturn\'s rings shaped by gravitational interactions with moons',
            'Lagrange points: Stable positions where gravitational forces balance (L1-L5 points)'
        ]
    },

    numericalMethods: {
        integration: [
            {
                name: 'Euler Integration',
                description: `Simple first-order method: x(t+Δt) = x(t) + v(t)Δt. Fast but accumulates errors 
                over time. For orbital mechanics, energy and angular momentum drift can cause orbits to spiral 
                or escape. Not recommended for long-term orbital simulations.`
            },
            {
                name: 'Runge-Kutta 4th Order (RK4)',
                description: `Fourth-order method providing better accuracy than Euler. Commonly used for orbital 
                mechanics. However, it doesn't preserve energy exactly, so orbits may still drift over many 
                periods. Good for short to medium-term simulations.`
            },
            {
                name: 'Symplectic Integrators',
                description: `Essential for long-term orbital simulations. Symplectic methods preserve the 
                Hamiltonian structure, maintaining energy and angular momentum conservation. The leapfrog/Verlet 
                method is a simple symplectic integrator ideal for gravitational N-body problems. Used in 
                professional astronomy software.`
            },
            {
                name: 'Adaptive Timestepping',
                description: `Orbits have varying timescales - objects move faster near periapsis, slower near 
                apoapsis. Adaptive timesteps improve both accuracy and efficiency. Smaller steps during close 
                approaches, larger steps during distant portions. Critical for highly elliptical orbits and 
                close encounters.`
            },
            {
                name: 'Barnes-Hut Algorithm',
                description: `Efficient algorithm for N-body simulations using hierarchical tree structure. 
                Groups distant particles, reducing computation from O(N²) to O(N log N). Essential for 
                simulating large systems (galaxies, star clusters). Used in professional astrophysics codes.`
            },
            {
                name: 'Fast Multipole Method',
                description: `Advanced algorithm for N-body problems using multipole expansions. Achieves O(N) 
                complexity for gravitational calculations. Used in large-scale cosmological simulations with 
                millions of particles.`
            }
        ],
        stability: `Orbital simulations require careful attention to numerical stability. Energy conservation is 
        critical - even small energy drift can cause orbits to spiral inward or escape over long timescales. 
        Symplectic integrators are essential for long-term stability. Timesteps should be much smaller than 
        the orbital period: Δt << T = 2π√(a³/GM). For highly elliptical orbits, adaptive timestepping is 
        recommended. Round-off errors accumulate over many orbits, so high precision arithmetic may be needed 
        for long simulations. The solar system simulation uses direct orbital calculations (not numerical 
        integration) for perfect stability and accuracy.`
    },

    furtherReading: [
        'Newton, I. (1687). Philosophiæ Naturalis Principia Mathematica. The foundational work on classical mechanics and universal gravitation.',
        'Einstein, A. (1915). The Field Equations of Gravitation. Introduced general relativity.',
        'Goldstein, H., Poole, C., & Safko, J. (2001). Classical Mechanics (3rd ed.). Addison-Wesley. Comprehensive treatment of orbital mechanics.',
        'Misner, C. W., Thorne, K. S., & Wheeler, J. A. (1973). Gravitation. W. H. Freeman. Definitive text on general relativity.',
        'Curtis, H. D. (2013). Orbital Mechanics for Engineering Students (3rd ed.). Butterworth-Heinemann. Practical guide for space missions.',
        'Vallado, D. A., & McClain, W. D. (2013). Fundamentals of Astrodynamics and Applications (4th ed.). Microcosm Press.',
        'Carroll, S. (2004). Spacetime and Geometry: An Introduction to General Relativity. Addison-Wesley.',
        'Thorne, K. S. (1994). Black Holes and Time Warps: Einstein\'s Outrageous Legacy. W. W. Norton & Company.',
        'Hawking, S. (1988). A Brief History of Time. Bantam Books. Popular introduction to cosmology and gravity.',
        'Susskind, L., & Hrabovsky, G. (2013). The Theoretical Minimum: What You Need to Know to Start Doing Physics. Basic Books.'
    ]
};

