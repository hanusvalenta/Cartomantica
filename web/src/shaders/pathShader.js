import * as THREE from '../../../node_modules/three/build/three.module.js';
export function createPathMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            color: { value: new THREE.Color(0x8B4513) }, // Earthy brown color
            opacity: { value: 0.8 }
        },
        vertexShader: `
            varying vec2 vUv;
            uniform float time;
            
            void main() {
                vUv = uv;
                vec3 transformed = position;
                
                // Slight undulation effect
                transformed.y += sin(position.x * 2.0 + time) * 0.02;
                transformed.y += cos(position.z * 2.0 + time) * 0.02;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            uniform float opacity;
            varying vec2 vUv;
            
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            
            void main() {
                // Create a weathered, organic texture
                float noise = random(vUv * 10.0 + time);
                
                // Vary color slightly
                vec3 finalColor = color * (0.8 + noise * 0.2);
                
                // Create a smooth fade at the start and end
                float startFade = smoothstep(0.0, 0.2, vUv.x);
                float endFade = 1.0 - smoothstep(0.8, 1.0, vUv.x);
                
                // Combine fades and apply to opacity
                float fadeOpacity = opacity * startFade * endFade;
                
                gl_FragColor = vec4(finalColor, fadeOpacity);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });
}
export function createPathGeometry(points, width = 1) {
    // Create a tube geometry along the curve points
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 
        points.length * 200,  // segments
        width,               // radius
        80,                   // radial segments
        false                // closed
    );
}