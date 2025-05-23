import React, { useRef } from 'react'
import { MeshTransmissionMaterial, useGLTF, Text } from "@react-three/drei";
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'

export default function Model() {
    const { nodes } = useGLTF("/models/chai.glb");
    const { viewport } = useThree()
    const torus = useRef(null);
    const animated = useRef({ x: 0, y: 0, z: 0 });
    
    const scaleControls = useControls('Scale', {
        scale: { value: 3, min: 0.1, max: 5, step: 0.1 }
    })

    const materialProps = useControls({
        thickness: { 
            value: 0.2, 
            min: 0, 
            max: 3, 
            step: 0.05
        },
        roughness: { 
            value: 0, 
            min: 0, 
            max: 1, 
            step: 0.1
        },
        transmission: {
            value: 1, 
            min: 0, 
            max: 1, 
            step: 0.1
        },
        ior: { 
            value: 1.2, 
            min: 0, 
            max: 3, 
            step: 0.1
        },
        chromaticAberration: { 
            value: 0.02, 
            min: 0, 
            max: 1
        },
        backside: { 
            value: true
        },
    })

    const rotationControls = useControls('Rotation', {
        rotationX: {
            value: 0,
            min: 0,
            max: Math.PI * 2,
            step: 0.1
        },
        rotationY: {
            value: 0,
            min: 0,
            max: Math.PI * 2,
            step: 0.1
        },
        rotationZ: {
            value: 0.2,
            min: 0,
            max: Math.PI * 2,
            step: 0.1
        },
        autoRotate: {
            value: true
        },
        rotationAxis: {
            value: 'y',
            options: ['x', 'y', 'z']
        },
        rotationSpeed: {
            value: 0.02,
            min: 0,
            max: 0.1,
            step: 0.001
        }
    })

    const positionControls = useControls('Position', {
        posX: { value: 0, min: -10, max: 10, step: 0.1 },
        posY: { value: -0.2, min: -10, max: 10, step: 0.1 },
        posZ: { value: 0, min: -10, max: 10, step: 0.1 }
    });

    useFrame(() => {
        if (rotationControls.autoRotate) {
            animated.current[rotationControls.rotationAxis] += rotationControls.rotationSpeed;
        } else {
            animated.current.x = 0;
            animated.current.y = 0;
            animated.current.z = 0;
        }
        torus.current.rotation.x = rotationControls.rotationX + animated.current.x;
        torus.current.rotation.y = rotationControls.rotationY + animated.current.y;
        torus.current.rotation.z = rotationControls.rotationZ + animated.current.z;
    })
    
    return (
        <group scale={viewport.width / 3.75} >
            <Text font={'/fonts/PPNeueMontreal-Bold.otf'} position={[0, 0, -1]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
                ChaiCode
            </Text>
            <mesh ref={torus} {...nodes.Cylinder001_1} scale={scaleControls.scale} position={[positionControls.posX, positionControls.posY, positionControls.posZ]}>
                <MeshTransmissionMaterial {...materialProps}/>
            </mesh>
        </group>
    )
}