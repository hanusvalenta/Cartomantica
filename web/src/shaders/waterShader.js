import * as THREE from '../../../node_modules/three/build/three.module.js';
export function createWaterMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            color: { value: new THREE.Color(0x4169E1) },
            opacity: { value: 0.7 },
            // Add shadow-related uniforms
            shadowMap: { value: null },
            shadowMatrix: { value: new THREE.Matrix4() },
            shadowBias: { value: 0.005 },
            shadowMapSize: { value: new THREE.Vector2(1024, 1024) },
            lightPosition: { value: new THREE.Vector3() }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec4 vShadowCoord;
            uniform float time;
            uniform mat4 shadowMatrix;
            
            void main() {
                vUv = uv;
                vec3 transformed = position;
                
                // Wave-like undulation effect
                float waveFrequency = 5.0;
                float waveAmplitude = 0.05;
                transformed.y += sin(position.x * waveFrequency + time) * waveAmplitude;
                transformed.y += cos(position.z * waveFrequency + time) * waveAmplitude;
                
                // Calculate shadow coordinates
                vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
                vShadowCoord = shadowMatrix * worldPosition;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            uniform float opacity;
            uniform sampler2D shadowMap;
            uniform float shadowBias;
            uniform vec2 shadowMapSize;
            
            varying vec2 vUv;
            varying vec4 vShadowCoord;
            
            // Simplex noise function (keep the existing noise implementation)
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
                const vec4 C = vec4(0.211324865405187,  
                                    0.366025403784439,  
                                   -0.577350269189626,  
                                    0.024390243902439); 
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
            
            // Percentage-closer filtering (PCF) for soft shadows
            float getShadowStrength() {
                vec3 shadowCoord = vShadowCoord.xyz / vShadowCoord.w;
                
                // Check if the point is within the shadow map
                if (shadowCoord.x < 0.0 || shadowCoord.x > 1.0 || 
                    shadowCoord.y < 0.0 || shadowCoord.y > 1.0 || 
                    shadowCoord.z > 1.0) {
                    return 1.0;
                }
                
                // Percentage-closer filtering (PCF)
                float shadow = 0.0;
                float bias = shadowBias;
                
                // 3x3 PCF for soft shadows
                for (float x = -1.0; x <= 1.0; x += 1.0) {
                    for (float y = -1.0; y <= 1.0; y += 1.0) {
                        vec2 offset = vec2(x, y) / shadowMapSize;
                        float depth = texture2D(shadowMap, shadowCoord.xy + offset).r;
                        shadow += step(shadowCoord.z - bias, depth);
                    }
                }
                
                return shadow / 9.0;
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
                
                // Apply shadow strength
                float shadowStrength = getShadowStrength();
                finalColor *= (0.5 + 0.5 * shadowStrength);
                
                gl_FragColor = vec4(finalColor, fadeOpacity * shadowStrength);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });
}
export function createWaterGeometry(points, width = 1) {
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 
        points.length * 200,
        width,
        80,
        false
    );
}