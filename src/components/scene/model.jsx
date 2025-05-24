import React, { useRef, useMemo, useState, useCallback } from 'react'
import { MeshTransmissionMaterial, useGLTF, Text } from "@react-three/drei";
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import './materials/liquidRefractionMaterial'
import lerp from 'lerp'

export default function Model() {
    const { nodes } = useGLTF("/models/chai.glb");
    const { viewport, size } = useThree()
    const torus = useRef(null);
    const liquidBody = useRef(null);
    const animated = useRef({ x: 0, y: 0, z: 0 });
    const wobbleAmountToAddX = useRef(0);
    const wobbleAmountToAddZ = useRef(0);
    const lastPos = useRef(new THREE.Vector3());
    const lastRot = useRef(new THREE.Vector3());
    const liquidTilt = useRef({ x: 0, z: 0, vx: 0, vz: 0 });
    const ripple = useRef({ amplitude: 0, phase: 0 });
    const [rippleActive, setRippleActive] = useState(false);
    const rippleTimeout = useRef(null);
    const prevShowLiquid = useRef(true);

    const scaleControls = useControls('Scale', {
        scale: { value: 3, min: 0.1, max: 5, step: 0.1 }
    })

    const materialProps = useControls({
        thickness: { value: 0.2, min: 0, max: 3, step: 0.05 },
        roughness: { value: 0, min: 0, max: 1, step: 0.1 },
        transmission: { value: 1, min: 0, max: 1, step: 0.1 },
        ior: { value: 1.2, min: 0, max: 3, step: 0.1 },
        chromaticAberration: { value: 0.02, min: 0, max: 1 },
        backside: { value: true },
    })

    const rotationControls = useControls('Rotation', {
        rotationX: { value: 0, min: 0, max: Math.PI * 2, step: 0.1 },
        rotationY: { value: 0, min: 0, max: Math.PI * 2, step: 0.1 },
        rotationZ: { value: 0.2, min: 0, max: Math.PI * 2, step: 0.1 },
        autoRotate: { value: true },
        rotationAxis: { value: 'y', options: ['x', 'y', 'z'] },
        rotationSpeed: { value: 0.02, min: 0, max: 0.1, step: 0.001 }
    })

    const positionControls = useControls('Position', {
        posX: { value: 0, min: -10, max: 10, step: 0.1 },
        posY: { value: -0.2, min: -10, max: 10, step: 0.1 },
        posZ: { value: 0, min: -10, max: 10, step: 0.1 }
    });

    const liquidControls = useControls('Liquid', {
        showLiquid: { value: true, label: 'Show Liquid' },
        fillAmount: { value: 0.07, min: -1, max: 1, step: 0.01, label: 'Height' },
        color: { value: '#c68642', label: 'Color' },
        opacity: { value: 0.85, min: 0, max: 1, step: 0.01 },
        rippleAmplitude: { value: 0.07, min: 0.01, max: 0.2, step: 0.01, label: 'Ripple Amplitude' }
    });

    const uniforms = useMemo(
        () => ({
            resolution: new THREE.Vector2(size.width, size.height),
            fillAmount: { value: liquidControls.fillAmount },
            wobbleX: { value: 0 },
            wobbleZ: { value: 0 },
            tiltX: { value: 0 },
            tiltZ: { value: 0 },
            rippleAmplitude: { value: 0 },
            ripplePhase: { value: 0 },
            tint: { value: new THREE.Vector4(...new THREE.Color(liquidControls.color).toArray(), liquidControls.opacity) }
        }),
        [size, liquidControls.fillAmount, liquidControls.color, liquidControls.opacity]
    );

    const triggerRipple = useCallback(() => {
        if (rippleActive) return;
        setRippleActive(true);
        ripple.current.amplitude = liquidControls.rippleAmplitude;
        ripple.current.phase = 0;
        if (rippleTimeout.current) clearTimeout(rippleTimeout.current);
        rippleTimeout.current = setTimeout(() => {
            setRippleActive(false);
        }, 700);
    }, [rippleActive, liquidControls.rippleAmplitude]);

    // Handle showLiquid toggle
    React.useEffect(() => {
        if (liquidControls.showLiquid !== prevShowLiquid.current) {
            if (liquidControls.showLiquid) {
                triggerRipple();
            } else {
                setRippleActive(false);
                ripple.current.amplitude = 0;
            }
            prevShowLiquid.current = liquidControls.showLiquid;
        }
    }, [liquidControls.showLiquid, triggerRipple]);

    // Cup click handler
    const handleCupClick = () => {
        if (!rippleActive && liquidControls.showLiquid) {
            triggerRipple();
        }
    };

    useFrame(({ clock }) => {
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

        const time = clock.getElapsedTime();
        const delta = Math.max(clock.getDelta(), 0.01);

        // Spring-damper inertia for liquid tilt
        const targetTiltX = rotationControls.autoRotate ? torus.current.rotation.x : 0;
        const targetTiltZ = rotationControls.autoRotate ? torus.current.rotation.z : 0;
        const stiffness = 8;
        const damping = 1.5;
        liquidTilt.current.vx += (targetTiltX - liquidTilt.current.x) * stiffness * delta;
        liquidTilt.current.vx *= Math.exp(-damping * delta);
        liquidTilt.current.vz += (targetTiltZ - liquidTilt.current.z) * stiffness * delta;
        liquidTilt.current.vz *= Math.exp(-damping * delta);
        liquidTilt.current.x += liquidTilt.current.vx * delta;
        liquidTilt.current.z += liquidTilt.current.vz * delta;

        // Ripples
        const velocity = lastPos.current.clone();
        velocity.sub(torus.current.position).divideScalar(delta);
        const rotationChange = new THREE.Vector3(
            torus.current.rotation.x - lastRot.current.x,
            torus.current.rotation.y - lastRot.current.y,
            torus.current.rotation.z - lastRot.current.z
        );
        const movement = velocity.length() + rotationChange.length();
        if (movement > 0.05) {
            ripple.current.amplitude = Math.min(ripple.current.amplitude + movement * 0.1, 0.2);
        }
        ripple.current.phase += delta * 6.0;
        // Only allow ripple if active
        if (!rippleActive) {
            ripple.current.amplitude = lerp(ripple.current.amplitude, 0, Math.max(clock.getDelta(), 0.01) * 2.5);
        }

        // Wobble
        const recovery = 4;
        const wobbleSpeed = 1;
        wobbleAmountToAddX.current = lerp(wobbleAmountToAddX.current, 0, delta * recovery);
        wobbleAmountToAddZ.current = lerp(wobbleAmountToAddZ.current, 0, delta * recovery);
        const pulse = 2 * Math.PI * wobbleSpeed;
        const wobbleAmountX = wobbleAmountToAddX.current * Math.sin(pulse * time);
        const wobbleAmountZ = wobbleAmountToAddZ.current * Math.cos(pulse * time);

        if (liquidControls.showLiquid && liquidBody.current) {
            liquidBody.current.material.uniforms.wobbleX.value = wobbleAmountX;
            liquidBody.current.material.uniforms.wobbleZ.value = wobbleAmountZ;
            liquidBody.current.material.uniforms.fillAmount.value = liquidControls.fillAmount;
            liquidBody.current.material.uniforms.tiltX.value = liquidTilt.current.x;
            liquidBody.current.material.uniforms.tiltZ.value = liquidTilt.current.z;
            liquidBody.current.material.uniforms.rippleAmplitude.value = ripple.current.amplitude;
            liquidBody.current.material.uniforms.ripplePhase.value = ripple.current.phase;
            const color = new THREE.Color(liquidControls.color);
            liquidBody.current.material.uniforms.tint.value = new THREE.Vector4(color.r, color.g, color.b, liquidControls.opacity);
        }
        lastPos.current = torus.current.position.clone();
        lastRot.current = new THREE.Vector3(
            torus.current.rotation.x,
            torus.current.rotation.y,
            torus.current.rotation.z
        );
    })
    
    return (
        <group scale={viewport.width / 3.75} >
            <Text font={'/fonts/PPNeueMontreal-Bold.otf'} position={[0, 0, -1]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
                ChaiCode
            </Text>
            <group ref={torus} position={[positionControls.posX, positionControls.posY, positionControls.posZ]} scale={scaleControls.scale} onClick={handleCupClick}>
                <mesh {...nodes.Cylinder001_1}>
                    <MeshTransmissionMaterial {...materialProps}/>
                </mesh>
                {liquidControls.showLiquid && (
                    <mesh ref={liquidBody} {...nodes.Cylinder001_1} scale={[0.98, 0.98, 0.98]}>
                        <liquidRefractionMaterial {...uniforms} />
                    </mesh>
                )}
            </group>
        </group>
    )
}