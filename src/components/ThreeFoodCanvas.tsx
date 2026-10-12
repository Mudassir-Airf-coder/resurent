import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeFoodCanvasProps {
  activeDishIndex: number;
  onResetView?: () => void;
}

export const ThreeFoodCanvas: React.FC<ThreeFoodCanvasProps> = ({
  activeDishIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const foodGroupRef = useRef<THREE.Group | null>(null);
  const modelsRef = useRef<THREE.Group[]>([]);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.6, 4.3));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.1, 0));

  const cameraConfigs = [
    { pos: new THREE.Vector3(0, 1.6, 4.3), look: new THREE.Vector3(0, 0.1, 0) },
    { pos: new THREE.Vector3(0.4, 1.7, 4.1), look: new THREE.Vector3(0, 0.15, 0) },
    { pos: new THREE.Vector3(0, 2.2, 3.8), look: new THREE.Vector3(0, -0.1, 0) },
    { pos: new THREE.Vector3(0, 2.5, 3.6), look: new THREE.Vector3(0, -0.15, 0) },
    { pos: new THREE.Vector3(0, 1.8, 4.5), look: new THREE.Vector3(0, 0.4, 0) }
  ];

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 390;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x181410, 0.12);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.6, 4.3);
    const currentLookAt = new THREE.Vector3(0, 0.1, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x2e251e, 2.0);
    scene.add(ambientLight);

    const keySpot = new THREE.SpotLight(0xffb86c, 6.5, 16, Math.PI / 4, 0.45, 1.2);
    keySpot.position.set(2.2, 4.8, 3.2);
    keySpot.castShadow = true;
    keySpot.shadow.bias = -0.001;
    scene.add(keySpot);

    const rimLight = new THREE.DirectionalLight(0xd4af37, 4.2);
    rimLight.position.set(-3.0, 3.5, -2.8);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xa5c4d4, 1.2, 8);
    fillLight.position.set(-2.4, 0.4, 2.2);
    scene.add(fillLight);

    // Pedestal & Contact Shadow
    const pedestalGroup = new THREE.Group();
    const discGeo = new THREE.CylinderGeometry(1.65, 1.8, 0.07, 48);
    const discMat = new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: 0.35, metalness: 0.8 });
    const pedestal = new THREE.Mesh(discGeo, discMat);
    pedestal.position.y = -0.96;
    pedestal.receiveShadow = true;
    pedestalGroup.add(pedestal);

    const goldRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.68, 0.02, 16, 48),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.95 })
    );
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = -0.92;
    pedestalGroup.add(goldRing);

    const shadowPlane = new THREE.Mesh(
      new THREE.CircleGeometry(1.45, 36),
      new THREE.MeshBasicMaterial({ color: 0x050404, transparent: true, opacity: 0.55 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.91;
    pedestalGroup.add(shadowPlane);
    scene.add(pedestalGroup);

    // Floating Golden Seasoning / Steam Particles
    const pCount = 45;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pVels: { x: number; y: number; z: number; seed: number }[] = [];
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 2.0;
      pPos[i * 3 + 1] = -0.5 + Math.random() * 2.2;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
      pVels.push({
        x: (Math.random() - 0.5) * 0.002,
        y: 0.005 + Math.random() * 0.008,
        z: (Math.random() - 0.5) * 0.002,
        seed: Math.random() * 10
      });
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const pGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      pGrad.addColorStop(0, 'rgba(255, 220, 140, 0.9)');
      pGrad.addColorStop(0.35, 'rgba(212, 175, 55, 0.5)');
      pGrad.addColorStop(1, 'rgba(0,0,0,0)');
      pCtx.fillStyle = pGrad;
      pCtx.fillRect(0, 0, 32, 32);
    }

    const pMat = new THREE.PointsMaterial({
      size: 0.16,
      map: new THREE.CanvasTexture(pCanvas),
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particleSystem = new THREE.Points(pGeo, pMat);
    scene.add(particleSystem);

    // PBR Food Materials
    const mats = {
      briocheTop: new THREE.MeshStandardMaterial({ color: 0xc8772a, roughness: 0.28, metalness: 0.06 }),
      briocheBottom: new THREE.MeshStandardMaterial({ color: 0xb96522, roughness: 0.42, metalness: 0.02 }),
      angusPatty: new THREE.MeshStandardMaterial({ color: 0x33190f, roughness: 0.88, metalness: 0.12 }),
      agedCheddar: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.08 }),
      truffleGlaze: new THREE.MeshStandardMaterial({ color: 0x1a120c, roughness: 0.35, metalness: 0.2 }),
      crispyChicken: new THREE.MeshStandardMaterial({ color: 0xaa4c14, roughness: 0.72, metalness: 0.04 }),
      pickle: new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.32, metalness: 0.05 }),
      fries: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.38, metalness: 0.03 }),
      bacon: new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.45, metalness: 0.1 }),
      crust: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65, metalness: 0.04 }),
      mozzarella: new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.22, metalness: 0.05 }),
      bowl: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.18, metalness: 0.85 }),
      shakeGlass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.82,
        opacity: 0.95,
        transparent: true,
        roughness: 0.16,
        ior: 1.45
      }),
      shakeCream: new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.3 }),
      caramel: new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.15, metalness: 0.15 }),
      goldStraw: new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.18, metalness: 0.92 })
    };

    // Procedural Models
    function createBurger() {
      const g = new THREE.Group();
      const bot = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 0.92, 0.35, 32), mats.briocheBottom);
      bot.position.y = -0.38;
      bot.castShadow = true;
      g.add(bot);
      const aioli = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.07, 28), mats.truffleGlaze);
      aioli.position.y = -0.18;
      g.add(aioli);
      const patty1 = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.1, 0.24, 32), mats.angusPatty);
      patty1.position.y = -0.05;
      patty1.castShadow = true;
      g.add(patty1);
      const chz = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 1.6), mats.agedCheddar);
      chz.rotation.y = 0.35;
      chz.position.y = 0.06;
      g.add(chz);
      const patty2 = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.08, 0.24, 32), mats.angusPatty);
      patty2.position.y = 0.2;
      patty2.castShadow = true;
      g.add(patty2);
      const top = new THREE.Mesh(
        new THREE.SphereGeometry(1.12, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.48),
        mats.briocheTop
      );
      top.position.y = 0.38;
      top.castShadow = true;
      g.add(top);
      const seedGeo = new THREE.SphereGeometry(0.026, 6, 6);
      const seedMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.3 });
      for (let i = 0; i < 30; i++) {
        const s = new THREE.Mesh(seedGeo, seedMat);
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * 0.35 + 0.06;
        const r = 1.13;
        s.position.set(r * Math.sin(v) * Math.cos(u), 0.38 + r * Math.cos(v), r * Math.sin(v) * Math.sin(u));
        s.scale.set(1.3, 0.5, 2.0);
        g.add(s);
      }
      return g;
    }

    function createChicken() {
      const g = new THREE.Group();
      const bot = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.9, 0.32, 30), mats.briocheBottom);
      bot.position.y = -0.42;
      g.add(bot);
      const slaw = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.12, 10, 24),
        new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.4 })
      );
      slaw.rotation.x = Math.PI / 2;
      slaw.position.y = -0.22;
      g.add(slaw);
      const chk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.48, 1.4), mats.crispyChicken);
      chk.rotation.y = 0.2;
      chk.position.y = 0.05;
      chk.castShadow = true;
      g.add(chk);
      const bump = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 1), mats.crispyChicken);
      bump.position.set(0.32, 0.18, -0.2);
      g.add(bump);
      const pkl = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.08, 16), mats.pickle);
      pkl.position.set(-0.38, 0.35, 0.3);
      pkl.rotation.set(0.1, 0.2, 0.15);
      g.add(pkl);
      const top = new THREE.Mesh(
        new THREE.SphereGeometry(1.08, 30, 16, 0, Math.PI * 2, 0, Math.PI * 0.47),
        mats.briocheTop
      );
      top.position.y = 0.4;
      top.castShadow = true;
      g.add(top);
      return g;
    }

    function createFries() {
      const g = new THREE.Group();
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 0.9, 0.72, 32), mats.bowl);
      bowl.position.y = -0.54;
      bowl.castShadow = true;
      g.add(bowl);
      const chz = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.1, 0.2, 28), mats.agedCheddar);
      chz.position.y = -0.2;
      g.add(chz);
      const fryGeo = new THREE.BoxGeometry(0.18, 1.1, 0.18);
      for (let i = 0; i < 22; i++) {
        const f = new THREE.Mesh(fryGeo, mats.fries);
        const ang = (i / 22) * Math.PI * 2;
        const r = 0.16 + (i % 4) * 0.26;
        f.position.set(Math.cos(ang) * r, 0.12 + (i % 5) * 0.08, Math.sin(ang) * r);
        f.rotation.set((Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 0.7);
        f.castShadow = true;
        g.add(f);
      }
      for (let b = 0; b < 12; b++) {
        const bcn = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.05, 0.18), mats.bacon);
        bcn.position.set((Math.random() - 0.5) * 1.2, 0.42 + Math.random() * 0.2, (Math.random() - 0.5) * 1.2);
        g.add(bcn);
      }
      return g;
    }

    function createPizza() {
      const g = new THREE.Group();
      const shape = new THREE.Shape();
      shape.moveTo(0, 1.65);
      shape.lineTo(1.12, -1.0);
      shape.quadraticCurveTo(0, -1.25, -1.12, -1.0);
      shape.closePath();
      const crustMesh = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, {
          depth: 0.15,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 1,
          bevelSize: 0.04,
          bevelThickness: 0.05
        }),
        mats.crust
      );
      crustMesh.rotation.x = -Math.PI / 2;
      crustMesh.position.y = -0.3;
      crustMesh.castShadow = true;
      g.add(crustMesh);
      const chz = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, { depth: 0.13, bevelEnabled: false }),
        mats.mozzarella
      );
      chz.rotation.x = -Math.PI / 2;
      chz.position.y = -0.22;
      chz.scale.set(0.92, 0.92, 1);
      g.add(chz);
      for (let m = 0; m < 7; m++) {
        const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.05, 12), mats.truffleGlaze);
        sh.position.set((Math.random() - 0.5) * 0.8, -0.05, (Math.random() - 0.5) * 1.2);
        g.add(sh);
      }
      const edge = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.25, 18), mats.crust);
      edge.rotation.z = Math.PI / 2;
      edge.position.set(0, -0.14, -1.0);
      g.add(edge);
      return g;
    }

    function createShake() {
      const g = new THREE.Group();
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.54, 2.0, 32, 1, true), mats.shakeGlass);
      cup.position.y = 0.02;
      cup.castShadow = true;
      g.add(cup);
      const milk = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.5, 1.85, 28), mats.shakeCream);
      milk.position.y = -0.04;
      g.add(milk);
      const cream = new THREE.Mesh(
        new THREE.SphereGeometry(0.76, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 })
      );
      cream.position.y = 0.96;
      g.add(cream);
      const sp = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 0.5, 20),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 })
      );
      sp.position.y = 1.35;
      g.add(sp);
      const car = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.07, 12, 32), mats.caramel);
      car.rotation.x = Math.PI / 2 + 0.2;
      car.position.y = 1.08;
      g.add(car);
      const str = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 16), mats.goldStraw);
      str.rotation.z = -0.28;
      str.position.set(0.3, 0.85, 0);
      g.add(str);
      return g;
    }

    const foodGroup = new THREE.Group();
    foodGroupRef.current = foodGroup;
    scene.add(foodGroup);

    const models = [createBurger(), createChicken(), createFries(), createPizza(), createShake()];
    modelsRef.current = models;

    models.forEach((m, idx) => {
      m.visible = idx === activeDishIndex;
      foodGroup.add(m);
    });

    targetCamPosRef.current.copy(cameraConfigs[activeDishIndex].pos);
    targetLookAtRef.current.copy(cameraConfigs[activeDishIndex].look);

    // Mouse / Touch Interaction
    let isDragging = false;
    let previousPos = { x: 0, y: 0 };

    const onDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousPos = { x: clientX, y: clientY };
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !foodGroupRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - previousPos.x;
      const dy = clientY - previousPos.y;
      foodGroupRef.current.rotation.y += dx * 0.012;
      foodGroupRef.current.rotation.x = Math.max(-0.35, Math.min(0.5, foodGroupRef.current.rotation.x + dy * 0.008));
      previousPos = { x: clientX, y: clientY };
    };

    const onUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    dom.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    const handleResize = () => {
      if (!containerRef.current) return;
      const nw = containerRef.current.clientWidth || 390;
      const nh = containerRef.current.clientHeight || 320;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      camera.position.lerp(targetCamPosRef.current, 0.07);
      currentLookAt.lerp(targetLookAtRef.current, 0.07);
      camera.lookAt(currentLookAt);

      if (!isDragging && foodGroupRef.current) {
        foodGroupRef.current.rotation.y += 0.008;
      }

      if (foodGroupRef.current) {
        foodGroupRef.current.position.y = Math.sin(t * 2.1) * 0.06 + 0.08;
      }
      shadowPlane.scale.setScalar(1 + Math.sin(t * 2.1) * 0.05);

      const posArr = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pCount; i++) {
        const v = pVels[i];
        posArr[i * 3 + 1] += v.y;
        posArr[i * 3] += Math.sin(t * 1.5 + v.seed) * 0.002;
        posArr[i * 3 + 2] += Math.cos(t * 1.5 + v.seed) * 0.002;
        if (posArr[i * 3 + 1] > 1.8) {
          posArr[i * 3 + 1] = -0.5;
          posArr[i * 3] = (Math.random() - 0.5) * 1.6;
          posArr[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      dom.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update visible model when activeDishIndex changes
  useEffect(() => {
    if (modelsRef.current.length === 0) return;
    const config = cameraConfigs[activeDishIndex] || cameraConfigs[0];
    targetCamPosRef.current.copy(config.pos);
    targetLookAtRef.current.copy(config.look);

    modelsRef.current.forEach((m, idx) => {
      m.visible = idx === activeDishIndex;
      if (idx === activeDishIndex) {
        m.scale.set(0.2, 0.2, 0.2);
        let s = 0.2;
        const popTimer = setInterval(() => {
          s += (1.0 - s) * 0.25;
          m.scale.set(s, s, s);
          if (s > 0.985) {
            m.scale.set(1, 1, 1);
            clearInterval(popTimer);
          }
        }, 16);
      }
    });
  }, [activeDishIndex]);

  // Expose reset view method
  const resetCameraView = () => {
    if (foodGroupRef.current) {
      foodGroupRef.current.rotation.set(0, 0, 0);
    }
    const config = cameraConfigs[activeDishIndex] || cameraConfigs[0];
    targetCamPosRef.current.copy(config.pos);
    targetLookAtRef.current.copy(config.look);
  };

  return (
    <div className="relative w-full h-[320px] bg-transparent overflow-hidden">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {/* Expose reset helper button hook if needed */}
      <button
        onClick={resetCameraView}
        className="hidden"
        id="internal-reset-view-btn"
        aria-label="Reset View"
      />
    </div>
  );
};
