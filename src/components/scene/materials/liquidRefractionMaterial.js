import * as THREE from 'three'
import { extend } from '@react-three/fiber'

export class LiquidRefractionMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    vNormal = normal;
                    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec2 resolution;
                uniform float fillAmount;
                uniform float wobbleX;
                uniform float wobbleZ;
                uniform float tiltX;
                uniform float tiltZ;
                uniform float rippleAmplitude;
                uniform float ripplePhase;
                uniform vec4 tint;
                
                varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                
                void main() {
                    // Simulate a wobbly and tilting liquid surface with ripples
                    float wobbleStrength = 0.15;
                    float tiltStrength = 1.0;
                    float ripple = rippleAmplitude * sin(8.0 * vPosition.x + ripplePhase) * cos(8.0 * vPosition.z + ripplePhase);
                    float surface = fillAmount
                        + tiltStrength * (tiltX * vPosition.x + tiltZ * vPosition.z)
                        + wobbleStrength * (wobbleX * vPosition.x + wobbleZ * vPosition.z)
                        + ripple;
                    if (vPosition.y > surface) discard;

                    // Simple diffuse lighting
                    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
                    float diff = max(dot(normalize(vNormal), lightDir), 0.0);
                    vec3 baseColor = tint.rgb * diff;
                    gl_FragColor = vec4(baseColor, tint.a);
                }
            `,
            uniforms: {
                resolution: { value: new THREE.Vector2() },
                fillAmount: { value: 0 },
                wobbleX: { value: 0 },
                wobbleZ: { value: 0 },
                tiltX: { value: 0 },
                tiltZ: { value: 0 },
                rippleAmplitude: { value: 0 },
                ripplePhase: { value: 0 },
                tint: { value: new THREE.Vector4(1, 0.8, 0.5, 0.85) }
            },
            transparent: true
        })
    }
}

extend({ LiquidRefractionMaterial }) 