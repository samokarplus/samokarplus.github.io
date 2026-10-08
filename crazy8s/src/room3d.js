import * as THREE from "three";

// A small low-poly casino lounge rendered behind the table UI:
// swinging lamps, a bartender, breathing patrons, drifting dust and a gently moving camera.

const SKINS = ["#f1b38a", "#c98a5e", "#e8a67c", "#8d5a3b"];
const SHIRTS = ["#e8d28a", "#2f4f7f", "#f4f1ea", "#7a2f4a", "#2c7a63"];
const HAIRS = ["#14121a", "#3a2415", "#6b4a2a", "#0b0b0f"];

function canvasTexture(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function feltTexture(color) {
  return canvasTexture(512, 512, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.62);
    grd.addColorStop(0, "#ffffff");
    grd.addColorStop(1, "#8c8c8c");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "multiply";
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "source-over";
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
      g.fillRect(Math.random() * w, Math.random() * h, 2, 1);
    }
  });
}

function mat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...extra });
}

function makeChair(color = "#1f6f86") {
  const g = new THREE.Group();
  const leather = mat(color, { roughness: 0.45 });
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.42, 0.14, 24), leather);
  seat.position.y = 0.5;
  const back = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.75, 24, 1, true, Math.PI * 0.6, Math.PI * 0.8),
    mat(color, { roughness: 0.45, side: THREE.DoubleSide }),
  );
  back.position.set(0, 0.98, 0);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8), mat("#25252b", { metalness: 0.7 }));
  post.position.y = 0.22;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 20), mat("#25252b", { metalness: 0.7 }));
  base.position.y = 0.02;
  g.add(seat, back, post, base);
  return g;
}

function makePerson(opts = {}) {
  const skin = mat(opts.skin || SKINS[0], { roughness: 0.55 });
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.45, 6, 14), mat(opts.shirt || SHIRTS[0], { roughness: 0.8 }));
  torso.position.y = 1.22;
  torso.scale.set(1.15, 1, 0.8);
  body.add(torso);
  if (opts.jacket) {
    const jacket = new THREE.Mesh(new THREE.CapsuleGeometry(0.29, 0.42, 6, 14), mat(opts.jacket, { roughness: 0.75 }));
    jacket.position.set(0, 1.2, 0.01);
    jacket.scale.set(1.2, 1, 0.84);
    body.add(jacket);
  }
  const head = new THREE.Group();
  head.position.y = 1.78;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), skin);
  skull.scale.set(0.95, 1.08, 1);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), skin);
  nose.position.set(0, -0.01, 0.2);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.215, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
    mat(opts.hair || HAIRS[0], { roughness: 0.6 }),
  );
  hair.position.y = 0.025;
  hair.rotation.x = -0.25;
  head.add(skull, nose, hair);
  const eyes = new THREE.Group();
  if (opts.shades) {
    const shades = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.04), mat("#050509", { roughness: 0.1, metalness: 0.6 }));
    shades.position.set(0, 0.04, 0.19);
    head.add(shades);
  } else {
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), mat("#0b0b10"));
      eye.position.set(s * 0.075, 0.04, 0.185);
      eyes.add(eye);
    }
    head.add(eyes);
  }
  if (opts.beanie) {
    const hat = new THREE.Mesh(new THREE.SphereGeometry(0.225, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(opts.beanie));
    hat.position.y = 0.05;
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.025, 8, 24), mat("#c8283c"));
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.07;
    head.add(hat, band);
  }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.15, 10), skin);
  neck.position.y = 1.62;
  body.add(neck, head);
  const arms = [];
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(s * 0.36, 1.42, 0.02);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.38, 4, 10), mat(opts.jacket || opts.shirt || SHIRTS[0], { roughness: 0.8 }));
    upper.position.set(0, -0.2, 0.08);
    upper.rotation.x = -0.5;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), skin);
    hand.position.set(0, -0.42, 0.28);
    arm.add(upper, hand);
    arm.rotation.x = -0.9;
    body.add(arm);
    arms.push(arm);
  }
  g.userData = { body, head, eyes, arms, phase: Math.random() * 10 };
  return g;
}

export function createRoom(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0c0818");
  scene.fog = new THREE.Fog("#140a24", 7, 19);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 60);
  const camBase = new THREE.Vector3(0, 2.7, 5.1);
  const lookAt = new THREE.Vector3(0, 0.45, -1.1);

  scene.add(new THREE.HemisphereLight("#ffd9a8", "#2a1a4a", 0.75));
  const spot = new THREE.SpotLight("#ffe2b0", 55, 14, 0.7, 0.6, 1.4);
  spot.position.set(0, 4.2, 0.4);
  spot.target.position.set(0, 0.8, -0.2);
  scene.add(spot, spot.target);

  // floor
  const carpet = canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = "#3a0f24";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#a8742f";
    g.lineWidth = 3;
    for (let i = -h; i < w + h; i += 32) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke();
      g.beginPath(); g.moveTo(i, h); g.lineTo(i + h, 0); g.stroke();
    }
  });
  carpet.wrapS = carpet.wrapT = THREE.RepeatWrapping;
  carpet.repeat.set(10, 8);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 24), new THREE.MeshStandardMaterial({ map: carpet, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -4;
  scene.add(floor);

  // back wall with windows
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 9), mat("#2a1840", { roughness: 0.9 }));
  wall.position.set(0, 4.5, -8.5);
  scene.add(wall);
  const sky = canvasTexture(64, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#ffd08a");
    grd.addColorStop(0.5, "#ff7fa6");
    grd.addColorStop(1, "#5c5cff");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  });
  const skyMat = new THREE.MeshBasicMaterial({ map: sky, fog: false });
  const windows = [];
  for (let i = -3; i <= 3; i++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 3.4), skyMat);
    w.position.set(i * 2.5, 3.5, -8.45);
    scene.add(w);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.4, 0.1), mat("#c9a45a", { metalness: 0.6, roughness: 0.3 }));
    frame.position.set(i * 2.5, 3.5, -8.4);
    scene.add(frame);
    windows.push(w);
  }

  // bar counter + shelves of glowing bottles
  const counter = new THREE.Mesh(new THREE.BoxGeometry(11, 1.05, 0.9), mat("#5a3218", { roughness: 0.35 }));
  counter.position.set(0, 0.52, -6.2);
  scene.add(counter);
  const counterTop = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.08, 1.05), mat("#9a6a3a", { roughness: 0.25 }));
  counterTop.position.set(0, 1.07, -6.2);
  scene.add(counterTop);
  const bottleColors = ["#ffb347", "#47d6a0", "#ff5d73", "#6aa8ff", "#e9d27a"];
  for (let shelf = 0; shelf < 3; shelf++) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.06, 0.45), mat("#9a6a3a"));
    board.position.set(0, 1.9 + shelf * 0.85, -7.7);
    scene.add(board);
    for (let b = 0; b < 26; b++) {
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 0.5 + (b % 3) * 0.08, 8),
        new THREE.MeshStandardMaterial({
          color: bottleColors[(b + shelf) % 5],
          emissive: bottleColors[(b + shelf) % 5],
          emissiveIntensity: 0.55,
          roughness: 0.2,
        }),
      );
      bottle.position.set(-5 + b * 0.4, 2.2 + shelf * 0.85, -7.7);
      scene.add(bottle);
    }
  }
  const stools = [];
  for (let i = -3; i <= 3; i++) {
    const stool = new THREE.Group();
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.1, 16), mat("#1f6f86", { roughness: 0.4 }));
    top.position.y = 0.78;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8), mat("#c9a45a", { metalness: 0.8, roughness: 0.3 }));
    leg.position.y = 0.38;
    stool.add(top, leg);
    stool.position.set(i * 1.5, 0, -5.3);
    scene.add(stool);
    stools.push(stool);
  }
  const bartender = makePerson({ skin: SKINS[1], shirt: "#f4f1ea", jacket: "#16161d", hair: HAIRS[0] });
  bartender.position.set(1.4, 0.15, -7.1);
  bartender.scale.setScalar(1.12);
  scene.add(bartender);

  // pillar + lamps
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 9, 24), mat("#e9d7bd", { roughness: 0.6 }));
  pillar.position.set(-4.6, 4.5, -3.6);
  scene.add(pillar);
  const lamps = [];
  const warm = new THREE.PointLight("#ffbf70", 9, 9, 1.6);
  warm.position.set(-4, 3.2, -2.4);
  scene.add(warm);
  for (const [x, z] of [[-1.7, -0.4], [0, -0.9], [1.7, -0.4], [-4.1, -3.3]]) {
    const lamp = new THREE.Group();
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 2.2, 4), mat("#222"));
    cord.position.y = 1.1;
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.34, 0.3, 18, 1, true),
      new THREE.MeshStandardMaterial({ color: "#ffd9a0", emissive: "#ffb85c", emissiveIntensity: 1.2, side: THREE.DoubleSide }),
    );
    shade.position.y = -0.05;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), new THREE.MeshBasicMaterial({ color: "#fff3cf" }));
    bulb.position.y = -0.08;
    lamp.add(cord, shade, bulb);
    lamp.position.set(x, 3.4, z);
    scene.add(lamp);
    lamps.push(lamp);
  }

  // poker table
  const table = new THREE.Group();
  let feltMat = new THREE.MeshStandardMaterial({ map: feltTexture("#216751"), roughness: 0.95 });
  const top = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.1, 72), feltMat);
  top.position.y = 0.82;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.62, 0.16, 18, 72), mat("#3a2418", { roughness: 0.4 }));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.9;
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.7, 0.55, 72), mat("#7a4a22", { roughness: 0.3 }));
  rail.position.y = 0.55;
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.95, 2.0, 72), new THREE.MeshBasicMaterial({ color: "#f2e7c8", transparent: true, opacity: 0.8 }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.875;
  table.add(top, rim, rail, ring);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 0.5, 20), mat("#1b1b22"));
  ped.position.y = 0.25;
  table.add(ped);
  table.scale.set(1, 1, 0.68);
  scene.add(table);

  // chip stacks
  const chipColors = ["#d8283f", "#2d5bd6", "#14141c", "#f4f1e6", "#1f9d6b"];
  const chipGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.035, 18);
  const chipMats = chipColors.map((c) => mat(c, { roughness: 0.4 }));
  const stacks = [];
  const stackSpots = [[-1.9, 0.5], [-1.55, 0.7], [1.6, 0.55], [1.95, 0.35], [-0.8, -0.95], [0.9, -0.9], [-2.1, -0.4]];
  stackSpots.forEach(([x, z], si) => {
    const s = new THREE.Group();
    const n = 5 + ((si * 3) % 7);
    for (let i = 0; i < n; i++) {
      const chip = new THREE.Mesh(chipGeo, chipMats[(si + (i > n / 2 ? 1 : 0)) % 5]);
      chip.position.y = 0.895 + i * 0.037;
      s.add(chip);
    }
    s.position.set(x, 0, z);
    scene.add(s);
    stacks.push(s);
  });
  const pot = new THREE.Group();
  for (let k = 0; k < 6; k++) {
    const chip = new THREE.Mesh(chipGeo, chipMats[k % 5]);
    chip.position.set(Math.cos(k * 1.2) * 0.25, 0.895 + (k % 2) * 0.037, Math.sin(k * 1.2) * 0.12 - 0.35);
    pot.add(chip);
  }
  scene.add(pot);

  // seats
  const slots = [-1, 0, 1].map((i) => {
    const a = i * 0.95;
    const pos = new THREE.Vector3(Math.sin(a) * 3.55, 0, -Math.cos(a) * 2.35 - 0.1);
    const chair = makeChair(i === 0 ? "#1f6f86" : "#7a2f4a");
    chair.position.copy(pos);
    chair.lookAt(0, 0, 0);
    chair.rotation.y += Math.PI;
    scene.add(chair);
    return { pos, a, chair, person: null };
  });
  const looks = [
    { skin: SKINS[0], shirt: SHIRTS[1], hair: HAIRS[1], beanie: "#3e4958" },
    { skin: SKINS[1], shirt: SHIRTS[0], hair: HAIRS[0] },
    { skin: SKINS[2], shirt: SHIRTS[2], hair: HAIRS[2], jacket: "#f4f1ea" },
  ];
  let people = [];
  function setSeats(count = 1) {
    people.forEach((p) => scene.remove(p));
    people = [];
    const picks = count <= 1 ? [1] : count === 2 ? [0, 2] : [0, 1, 2];
    picks.forEach((slotIndex, n) => {
      const slot = slots[slotIndex];
      const p = makePerson({ ...looks[(slotIndex + (count === 1 ? 1 : 0)) % 3], shades: count === 1 });
      p.position.set(slot.pos.x * 0.97, 0.12, slot.pos.z * 0.97);
      p.lookAt(0, 0.12, 0.2);
      p.userData.seat = n;
      scene.add(p);
      people.push(p);
    });
  }
  setSeats(1);
  let active = -1;

  // dust motes
  const dustN = 180;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 12;
    dustPos[i * 3 + 1] = Math.random() * 4.5;
    dustPos[i * 3 + 2] = -7 + Math.random() * 10;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: "#ffd9a0", size: 0.035, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  const pointer = { x: 0, y: 0 };
  const clock = new THREE.Clock();
  let running = true;
  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1.3 ? 48 + (1.3 - w / h) * 22 : 48;
    camera.updateProjectionMatrix();
  }
  function frame() {
    if (!running) return;
    const t = clock.getElapsedTime();
    resize();
    camera.position.set(
      camBase.x + pointer.x * 0.45 + Math.sin(t * 0.23) * 0.12,
      camBase.y - pointer.y * 0.18 + Math.sin(t * 0.31) * 0.05,
      camBase.z + Math.sin(t * 0.17) * 0.08,
    );
    camera.lookAt(lookAt.x + pointer.x * 0.3, lookAt.y, lookAt.z);
    lamps.forEach((l, i) => {
      l.rotation.z = Math.sin(t * 0.8 + i) * 0.045;
      l.rotation.x = Math.cos(t * 0.6 + i * 2) * 0.03;
    });
    warm.intensity = 8.5 + Math.sin(t * 5.3) * 0.5 + Math.sin(t * 2.1) * 0.6;
    skyMat.color.setHSL(0.06 + Math.sin(t * 0.15) * 0.015, 0.4, 0.62 + Math.sin(t * 0.4) * 0.05);
    stacks.forEach((s, i) => (s.position.y = Math.sin(t * 1.4 + i) * 0.002));
    for (const person of [...people, bartender]) {
      const d = person.userData;
      const k = t + d.phase;
      const isActive = people.indexOf(person) === active;
      d.body.scale.y = 1 + Math.sin(k * 1.6) * 0.012;
      d.body.rotation.x = isActive ? 0.12 + Math.sin(k * 3) * 0.03 : Math.sin(k * 0.7) * 0.02;
      d.head.rotation.y = Math.sin(k * 0.5) * 0.45 + (person === bartender ? 0 : pointer.x * 0.2);
      d.head.rotation.x = isActive ? 0.2 : Math.sin(k * 0.8) * 0.06;
      d.eyes.scale.y = Math.sin(k * 1.1) > 0.985 ? 0.1 : 1;
      if (person === bartender) {
        d.arms[1].rotation.x = -1.0 + Math.sin(k * 2.2) * 0.35;
        d.arms[1].rotation.z = Math.sin(k * 2.2) * 0.25;
        d.arms[0].rotation.x = -0.6;
      } else {
        d.arms[0].rotation.x = -0.95 + Math.sin(k * 0.9) * 0.05;
        d.arms[1].rotation.x = isActive ? -1.15 + Math.sin(k * 5) * 0.18 : -0.95 + Math.sin(k * 1.3 + 1) * 0.1;
      }
    }
    const pos = dust.geometry.attributes.position;
    for (let i = 0; i < dustN; i++) {
      pos.array[i * 3 + 1] += 0.002 + (i % 5) * 0.0006;
      pos.array[i * 3] += Math.sin(t * 0.3 + i) * 0.0012;
      if (pos.array[i * 3 + 1] > 4.6) pos.array[i * 3 + 1] = 0;
    }
    pos.needsUpdate = true;
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(frame);
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    renderer.setAnimationLoop(running ? frame : null);
  });

  return {
    setSeats,
    setActive(i) {
      active = i;
    },
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    setTheme(color) {
      feltMat.map?.dispose();
      feltMat.map = feltTexture(color);
      feltMat.needsUpdate = true;
    },
    dispose() {
      renderer.setAnimationLoop(null);
      renderer.dispose();
    },
  };
}
