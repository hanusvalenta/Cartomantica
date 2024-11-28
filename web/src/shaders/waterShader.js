import * as THREE from '../../../node_modules/three/build/three.module.js';
export function createWaterMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            color: { value: new THREE.Color(0x4169E1) }, // Royal Blue for water
            opacity: { value: 0.7 }
        },
        vertexShader: `
            varying vec2 vUv;
            uniform float time;
            
            void main() {
                vUv = uv;
                vec3 transformed = position;
                
                // Wave-like undulation effect
                float waveFrequency = 5.0;
                float waveAmplitude = 0.05;
                transformed.y += sin(position.x * waveFrequency + time) * waveAmplitude;
                transformed.y += cos(position.z * waveFrequency + time) * waveAmplitude;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            uniform float opacity;
            varying vec2 vUv;
            
            // Simplex noise function
            vec3 mod289(vec3 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }
            vec2 mod289(vec2 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }
            vec3 permute(vec3 x) {
                return mod289(((x*34.0)+1.0)*x);
            }
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                    0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                                   -0.577350269189626,  // -1.0 + 2.0 * C.x
                                    0.024390243902439); // 1.0 / 41.0
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                    + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                    dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            void main() {
                // Create water-like noise
                float noise1 = snoise(vUv * 10.0 + time * 0.2);
                float noise2 = snoise(vUv * 15.0 - time * 0.15);
                
                // Combine noises for more complex water texture
                float combinedNoise = (noise1 + noise2) * 0.5;
                
                // Vary color with noise
                vec3 finalColor = color * (0.9 + combinedNoise * 0.2);
                
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
export function createWaterGeometry(points, width = 1) {
    // Create a tube geometry along the curve points
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 
        points.length * 200,  // segments
        width,               // radius
        80,                   // radial segments
        false                // closed
    );
}