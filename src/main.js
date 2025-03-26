import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';

class DroneSimulation {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.drones = [];
        this.currentFormation = 'grid';
        
        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.set(0, 10, 20);
        this.camera.lookAt(0, 0, 0);

        // Add controls
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        this.scene.add(ground);

        // Create drones
        this.createDrones(9); // Create 9 drones in a 3x3 grid

        // Start animation loop
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    createDrone() {
        const drone = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.BoxGeometry(1, 0.5, 1);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        drone.add(body);

        // Propellers
        const propellerGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8);
        const propellerMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        
        const positions = [
            [-0.5, 0.5, -0.5],
            [0.5, 0.5, -0.5],
            [-0.5, 0.5, 0.5],
            [0.5, 0.5, 0.5]
        ];

        positions.forEach(pos => {
            const propeller = new THREE.Mesh(propellerGeometry, propellerMaterial);
            propeller.position.set(...pos);
            propeller.rotation.x = Math.PI / 2;
            drone.add(propeller);
        });

        return drone;
    }

    createDrones(count) {
        for (let i = 0; i < count; i++) {
            const drone = this.createDrone();
            this.drones.push(drone);
            this.scene.add(drone);
        }
        this.updateFormation();
    }

    updateFormation() {
        const spacing = 2;
        const droneCount = this.drones.length;
        const gridSize = Math.ceil(Math.sqrt(droneCount));

        this.drones.forEach((drone, index) => {
            let x, y, z;
            
            switch (this.currentFormation) {
                case 'grid':
                    x = (index % gridSize - gridSize/2 + 0.5) * spacing;
                    z = (Math.floor(index / gridSize) - gridSize/2 + 0.5) * spacing;
                    y = 2;
                    break;
                    
                case 'wave':
                    x = (index - droneCount/2 + 0.5) * spacing;
                    y = Math.sin(index * 0.5) * 2 + 2;
                    z = 0;
                    break;
                    
                case 'spiral':
                    const angle = index * (2 * Math.PI / droneCount);
                    const radius = 2 + index * 0.5;
                    x = Math.cos(angle) * radius;
                    z = Math.sin(angle) * radius;
                    y = 2;
                    break;
            }

            gsap.to(drone.position, {
                x: x,
                y: y,
                z: z,
                duration: 1,
                ease: "power2.inOut"
            });
        });
    }

    setFormation(formation) {
        this.currentFormation = formation;
        this.updateFormation();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Animate propellers
        this.drones.forEach(drone => {
            drone.children.slice(1).forEach(propeller => {
                propeller.rotation.z += 0.1;
            });
        });

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Create and expose the simulation instance
window.simulation = new DroneSimulation(); 