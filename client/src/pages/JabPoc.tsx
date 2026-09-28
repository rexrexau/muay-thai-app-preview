import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const DEFAULT_GLB_URL = '/manus-storage/Soldier_601d2493.glb';

function makeFallbackScene(scene: THREE.Scene) {
  const group = new THREE.Group();

  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.8, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x8b5cf6 }),
  );
  torso.position.y = 1.5;
  group.add(torso);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xf4d2a2 }),
  );
  head.position.y = 2.8;
  group.add(head);

  const leftArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 1.4, 0.25),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b }),
  );
  leftArm.position.set(-0.9, 2.0, 0);
  leftArm.rotation.z = Math.PI / 3;
  group.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.9;
  rightArm.rotation.z = -Math.PI / 3;
  group.add(rightArm);

  const leftLeg = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 1.7, 0.32),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8 }),
  );
  leftLeg.position.set(-0.3, 0.6, 0);
  group.add(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.3;
  group.add(rightLeg);

  scene.add(group);
  return { group };
}

export default function JabPoc() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState('Initialising...');
  const [debugEnabled, setDebugEnabled] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('debug') === '1';
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
    camera.position.set(0, 1.6, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth || 900, mount.clientHeight || 700);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x0b1324, 1.1);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2, 4, 3);
    scene.add(key);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(7, 64),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9, metalness: 0.1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.1;
    scene.add(floor);

    const fallback = makeFallbackScene(scene);

    const updateBbox = () => {
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      (window as any).__jabPocDebug = {
        loaded: true,
        meshCount: fallback.group.children.length,
        skinnedMeshCount: 0,
        animationNames: [],
        bbox: {
          min: [box.min.x, box.min.y, box.min.z],
          max: [box.max.x, box.max.y, box.max.z],
          size: [size.x, size.y, size.z],
        },
        fallbackUsed: true,
      };
    };

    updateBbox();

    const loader = new GLTFLoader();

    loader.load(
      DEFAULT_GLB_URL,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        setStatus('Model loaded: Soldier GLB detected');
        updateBbox();
      },
      undefined,
      () => {
        setStatus('GLB fallback active: model could not be loaded, using debug scene');
        updateBbox();
      },
    );

    const handleResize = () => {
      const width = mount.clientWidth || 900;
      const height = mount.clientHeight || 700;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const animate = () => {
      fallback.group.rotation.y += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    handleResize();
    animate();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [debugEnabled]);

  return (
    <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0', padding: 24 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Jab POC</h2>
        <button
          type="button"
          onClick={() => setDebugEnabled((prev) => !prev)}
          style={{
            background: debugEnabled ? '#16a34a' : '#334155',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0.5rem 1rem',
            cursor: 'pointer',
          }}
        >
          {debugEnabled ? 'Debug On' : 'Debug Off'}
        </button>
      </div>

      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 13, color: '#cbd5e1' }}>
        <strong>Status:</strong> {status}
      </div>

      <div ref={mountRef} style={{ width: '100%', minHeight: '70vh', borderRadius: 14, border: '1px solid #374151', background: '#020617', overflow: 'hidden' }} />
    </div>
  );
}
