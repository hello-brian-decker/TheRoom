/**
 * Rigid Body Dynamics Documentation
 */

export const rigidBodyDocumentation = {
    overview: `Rigid body dynamics extends particle physics to include rotational motion. Unlike particles, 
    rigid bodies have orientation, angular velocity, and moment of inertia. This demonstration shows how 
    boxes and spheres collide, stack, and interact under the influence of forces and torques.`,

    mathematicalFoundation: {
        equations: [
            {
                formula: 'F = ma',
                description: 'Newton\'s second law for linear motion',
                variables: 'F = force vector, m = mass, a = acceleration vector'
            },
            {
                formula: 'τ = Iα',
                description: 'Rotational analog of Newton\'s second law',
                variables: 'τ = torque, I = moment of inertia, α = angular acceleration'
            },
            {
                formula: 'L = Iω',
                description: 'Angular momentum of a rotating body',
                variables: 'L = angular momentum, ω = angular velocity'
            },
            {
                formula: 'm₁v₁ + m₂v₂ = m₁v₁\' + m₂v₂\'',
                description: 'Conservation of linear momentum in collisions',
                variables: 'm = mass, v = velocity (before and after collision)'
            },
            {
                formula: 'I = ∫ r² dm',
                description: 'Moment of inertia: resistance to rotational acceleration',
                variables: 'r = distance from axis, dm = mass element'
            },
            {
                formula: 'I_box = (1/12)m(h² + d²)',
                description: 'Moment of inertia for a box about its center',
                variables: 'h = height, d = depth'
            },
            {
                formula: 'I_sphere = (2/5)mr²',
                description: 'Moment of inertia for a solid sphere',
                variables: 'r = radius'
            },
            {
                formula: 'J = -(1 + e)(v_rel · n) / (1/m₁ + 1/m₂)',
                description: 'Impulse magnitude for collision resolution',
                variables: 'J = impulse, e = coefficient of restitution, v_rel = relative velocity, n = collision normal'
            },
            {
                formula: 'τ = r × F',
                description: 'Torque as cross product of position and force vectors',
                variables: 'r = position vector from pivot, F = force vector'
            }
        ],
        concepts: [
            {
                name: 'Center of Mass',
                description: `The point at which all mass can be considered concentrated for translational motion. 
                For uniform objects, it's at the geometric center. The center of mass follows Newton's laws as if 
                all forces acted directly on it.`
            },
            {
                name: 'Moment of Inertia',
                description: `Rotational analog of mass. It depends on both the mass and its distribution relative 
                to the rotation axis. Objects with mass farther from the axis have larger moments of inertia and 
                are harder to rotate.`
            },
            {
                name: 'Torque and Angular Acceleration',
                description: `Torque causes angular acceleration, just as force causes linear acceleration. The 
                relationship τ = Iα means that for a given torque, objects with larger moments of inertia 
                experience less angular acceleration.`
            },
            {
                name: 'Impulse-Based Collision Resolution',
                description: `Collisions are resolved by applying impulses (instantaneous changes in momentum) to 
                both objects. The impulse magnitude depends on relative velocity, masses, and coefficient of 
                restitution. This method conserves momentum while allowing energy loss.`
            },
            {
                name: 'Stacking and Stability',
                description: `When objects stack, stability depends on the center of mass position relative to 
                the base of support. If the center of mass moves outside the base, the object topples. Friction 
                and interlocking geometries also play crucial roles.`
            }
        ]
    },

    realWorldApplications: {
        engineering: [
            'Vehicle dynamics: Modeling how cars respond to forces during cornering and collisions',
            'Robotics: Controlling robot arms and manipulators requires understanding torque and inertia',
            'Structural engineering: Analyzing stability of stacked or connected structural elements',
            'Game physics engines: Realistic object interactions in video games and simulations',
            'Packaging design: Ensuring stacked packages remain stable during transport',
            'Construction: Understanding how building materials stack and support loads'
        ],
        physics: [
            'Celestial mechanics: Rotational dynamics of planets and asteroids',
            'Molecular dynamics: Rotational motion of molecules and molecular collisions',
            'Particle physics: Angular momentum conservation in particle collisions',
            'Solid state physics: Rotational dynamics of crystal structures'
        ],
        examples: [
            'Dominoes falling: Each domino transfers momentum and rotational energy to the next',
            'Stacking blocks: Understanding center of mass helps build stable structures',
            'Spinning tops: Angular momentum conservation keeps them upright',
            'Car crashes: Momentum conservation determines post-collision trajectories',
            'Sports: Basketball spins, football tumbles - all governed by rotational dynamics',
            'Jenga: Removing blocks changes the center of mass, affecting stability'
        ]
    },

    numericalMethods: {
        integration: [
            {
                name: 'Euler Integration',
                description: `Both linear and angular motion are integrated using Euler's method. Position, 
                velocity, orientation, and angular velocity are updated each timestep. For rotational motion, 
                quaternions or rotation matrices are typically used to avoid gimbal lock.`
            },
            {
                name: 'Collision Detection',
                description: `Broad-phase collision detection (spatial grid or BVH) quickly eliminates impossible 
                pairs. Narrow-phase uses SAT (Separating Axis Theorem) for boxes and distance checks for spheres. 
                Contact information includes penetration depth and collision normal.`
            },
            {
                name: 'Constraint Resolution',
                description: `Position correction after collisions prevents interpenetration. Sequential impulse 
                methods iteratively resolve multiple contacts. For stability, constraints are solved in multiple 
                iterations per frame.`
            }
        ],
        stability: `Small timesteps are crucial for stability, especially during fast collisions. Position correction 
        prevents objects from sinking into each other. Damping factors prevent numerical oscillations. For rotational 
        motion, quaternion normalization prevents drift. The simulation uses fixed timesteps with sub-stepping for 
        high-speed collisions.`
    },

    furtherReading: [
        'Goldstein, H., Poole, C., & Safko, J. (2001). Classical Mechanics (3rd ed.). Addison-Wesley.',
        'Baraff, D., & Witkin, A. (1998). "Large Steps in Cloth Simulation." SIGGRAPH.',
        'Erleben, K., et al. (2018). Physics-Based Animation. CRC Press.',
        'Millington, I. (2007). Game Physics Engine Development. Morgan Kaufmann.',
        'Featherstone, R. (2014). Rigid Body Dynamics Algorithms. Springer.'
    ]
};

