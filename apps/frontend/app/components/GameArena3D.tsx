"use client";

import { useEffect, useRef } from "react";

export default function GameArena3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let frameId = 0;
    let cleanup = () => {};
    let isMounted = true;

    async function mountScene() {
      const THREE = await import("three");
      if (!isMounted || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x05080c);
      scene.fog = new THREE.Fog(0x05080c, 34, 95);

      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 160);
      camera.position.set(0, 20, 35);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const resize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const ambient = new THREE.HemisphereLight(0x7dd3fc, 0x102015, 1.6);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(-18, 35, 18);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.camera.left = -55;
      keyLight.shadow.camera.right = 55;
      keyLight.shadow.camera.top = 55;
      keyLight.shadow.camera.bottom = -55;
      scene.add(keyLight);

      const field = new THREE.Mesh(
        new THREE.PlaneGeometry(58, 86),
        new THREE.MeshStandardMaterial({ color: 0x0d6b38, roughness: 0.72, metalness: 0.04 }),
      );
      field.rotation.x = -Math.PI / 2;
      field.receiveShadow = true;
      scene.add(field);

      const stripeMaterialA = new THREE.MeshStandardMaterial({ color: 0x128144, roughness: 0.75 });
      const stripeMaterialB = new THREE.MeshStandardMaterial({ color: 0x0b5d32, roughness: 0.78 });
      for (let index = 0; index < 10; index += 1) {
        const stripe = new THREE.Mesh(
          new THREE.PlaneGeometry(58, 8.6),
          index % 2 ? stripeMaterialA : stripeMaterialB,
        );
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(0, 0.012, -38.7 + index * 8.6);
        stripe.receiveShadow = true;
        scene.add(stripe);
      }

      const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xe6fff1 });
      const addLine = (width: number, depth: number, x: number, z: number) => {
        const line = new THREE.Mesh(new THREE.BoxGeometry(width, 0.045, depth), lineMaterial);
        line.position.set(x, 0.05, z);
        scene.add(line);
      };

      addLine(58, 0.18, 0, 0);
      addLine(58, 0.16, 0, -43);
      addLine(58, 0.16, 0, 43);
      addLine(0.16, 86, -29, 0);
      addLine(0.16, 86, 29, 0);
      addLine(20, 0.16, 0, -30);
      addLine(20, 0.16, 0, 30);
      addLine(0.16, 13, -10, -36.5);
      addLine(0.16, 13, 10, -36.5);
      addLine(0.16, 13, -10, 36.5);
      addLine(0.16, 13, 10, 36.5);

      const centerRing = new THREE.Mesh(
        new THREE.TorusGeometry(6.2, 0.08, 10, 90),
        new THREE.MeshBasicMaterial({ color: 0xe6fff1 }),
      );
      centerRing.rotation.x = Math.PI / 2;
      centerRing.position.y = 0.07;
      scene.add(centerRing);

      const goalMaterial = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.15 });
      const addGoal = (z: number) => {
        const group = new THREE.Group();
        const crossbar = new THREE.Mesh(new THREE.BoxGeometry(13, 0.35, 0.35), goalMaterial);
        crossbar.position.set(0, 3.2, z);
        const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.2, 0.35), goalMaterial);
        leftPost.position.set(-6.5, 1.6, z);
        const rightPost = leftPost.clone();
        rightPost.position.x = 6.5;
        group.add(crossbar, leftPost, rightPost);
        group.traverse((item) => {
          if (item instanceof THREE.Mesh) item.castShadow = true;
        });
        scene.add(group);
      };
      addGoal(-44.5);
      addGoal(44.5);

      const standMaterial = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.55, metalness: 0.08 });
      const accentMaterial = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.35, metalness: 0.25 });
      for (const side of [-1, 1]) {
        const stand = new THREE.Mesh(new THREE.BoxGeometry(72, 9, 8), standMaterial);
        stand.position.set(0, 5, side * 54);
        stand.castShadow = true;
        scene.add(stand);

        const ribbon = new THREE.Mesh(new THREE.BoxGeometry(68, 1.2, 0.7), accentMaterial);
        ribbon.position.set(0, 8.5, side * 49.8);
        scene.add(ribbon);
      }

      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 32, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 }),
      );
      ball.position.set(0, 0.9, 0);
      ball.castShadow = true;
      scene.add(ball);

      const playerMaterialA = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.45 });
      const playerMaterialB = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.45 });
      const playerMarkers: InstanceType<typeof THREE.Mesh>[] = [];
      for (let index = 0; index < 14; index += 1) {
        const marker = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.55, 1.4, 5, 10),
          index % 2 ? playerMaterialA : playerMaterialB,
        );
        marker.position.set(((index % 7) - 3) * 6, 1, index < 7 ? -14 : 14);
        marker.castShadow = true;
        playerMarkers.push(marker);
        scene.add(marker);
      }

      const clock = new THREE.Clock();
      const animate = () => {
        const elapsed = clock.getElapsedTime();
        camera.position.x = Math.sin(elapsed * 0.18) * 7;
        camera.position.z = 35 + Math.cos(elapsed * 0.16) * 5;
        camera.lookAt(0, 0, 0);
        ball.position.x = Math.sin(elapsed * 1.3) * 8;
        ball.position.z = Math.cos(elapsed * 1.1) * 5;
        ball.rotation.x += 0.025;
        ball.rotation.z += 0.018;
        playerMarkers.forEach((marker, index) => {
          marker.position.y = 1 + Math.sin(elapsed * 2 + index) * 0.08;
        });
        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(animate);
      };

      resize();
      window.addEventListener("resize", resize);
      animate();

      cleanup = () => {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener("resize", resize);
        renderer.dispose();
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            const material = object.material;
            if (Array.isArray(material)) material.forEach((item) => item.dispose());
            else material.dispose();
          }
        });
      };
    }

    mountScene();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 h-screen w-screen bg-[#05080c]" aria-hidden="true" />;
}
