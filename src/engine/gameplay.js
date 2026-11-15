import * as THREE from 'three';

const STORE = 'echoes-beneath-the-tide:progress:v1';
const BIOMES = [
  'Whispering Reeds', 'Sunken Orchard', 'Sunken Cathedral', 'Rust-Harbor Graveyard',
  'Bioluminescent Marsh', 'Salt-Mirror Flats', 'Lantern-Paper Archipelago', 'Mangroves of Echoes',
  'Glass Glacier', 'Volcanic Caldera', 'Clockwork Aqueduct', 'Abyssal Trenches',
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export class Gameplay {
  constructor(engine) {
    this.engine = engine;
    this.group = new THREE.Group();
    this.group.name = 'memory shards and river wardens';
    engine.scene.add(this.group);
    this.entities = [];
    this.realm = null;
    this.nextSpawn = 0;
    this.parry = 0;
    this.slash = 0;
    this.toastTimer = 0;
    this.contract = null;
    this.progress = this.load();
    this.makeSlash();
    this.makeHud();
    engine.on('realm', (inst) => this.enter(inst));
    engine.on('update', (dt) => this.update(dt));
  }

  load() {
    const defaults = { glimmer: 0, shards: 0, hull: 100, oil: 100, maxHull: 100, maxOil: 100, parryLevel: 0, visited: [] };
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (!saved || typeof saved !== 'object') return defaults;
      return { ...defaults, ...saved, visited: Array.isArray(saved.visited) ? saved.visited : [] };
    } catch { return defaults; }
  }

  save() {
    try { localStorage.setItem(STORE, JSON.stringify(this.progress)); } catch { /* storage is optional */ }
  }

  makeHud() {
    const style = document.createElement('style');
    style.textContent = `
      #tide-gameplay { position:fixed; z-index:3; top:5.25rem; right:max(1.25rem,env(safe-area-inset-right)); width:min(19rem,calc(100vw - 2.5rem)); pointer-events:none; font:500 1rem/1.2 "Cormorant Garamond",Georgia,serif; color:#f4efe6; text-shadow:0 2px 12px #000; }
      #tide-gameplay[hidden] { display:none; }
      .tide-row { display:flex; justify-content:space-between; gap:1rem; margin:.25rem 0; }
      .tide-label { color:rgba(244,239,230,.72); font:600 .62rem/1.2 system-ui,sans-serif; letter-spacing:.12em; text-transform:uppercase; }
      .tide-value { font-size:1.05rem; }
      .tide-meter { height:3px; margin:.2rem 0 .55rem; background:rgba(244,239,230,.2); }
      .tide-meter i { display:block; height:100%; width:100%; background:#ffb703; transition:width .25s; }
      .tide-meter.oil i { background:#00f5d4; }
      .tide-card { margin-top:.6rem; padding:.7rem .8rem; border:1px solid rgba(244,239,230,.18); background:rgba(8,10,18,.38); backdrop-filter:blur(.4rem); }
      .tide-card strong { display:block; font-size:1.2rem; font-weight:500; }
      .tide-card small { display:block; margin-top:.15rem; color:rgba(244,239,230,.68); }
      .tide-actions { display:flex; gap:.4rem; margin-top:.55rem; pointer-events:auto; }
      .tide-actions button { padding:.35rem .5rem; border:1px solid rgba(255,183,3,.6); background:rgba(255,183,3,.1); color:#f4efe6; font:600 .62rem system-ui,sans-serif; cursor:pointer; }
      .tide-actions button:hover { background:rgba(255,183,3,.25); }
      #tide-toast { position:fixed; left:50%; top:20%; transform:translate(-50%,-50%); opacity:0; transition:opacity .25s; color:#ffdf91; font-size:1.45rem; pointer-events:none; text-align:center; }
      #tide-toast.is-on { opacity:1; }
      #tide-controls { margin-top:.6rem; color:rgba(244,239,230,.6); font:600 .58rem/1.5 system-ui,sans-serif; letter-spacing:.06em; text-transform:uppercase; }
      #tide-controls kbd { border:1px solid rgba(244,239,230,.35); border-radius:3px; padding:.12rem .28rem; color:#fff; }
    `;
    document.head.append(style);
    this.hud = document.createElement('aside');
    this.hud.id = 'tide-gameplay';
    this.hud.innerHTML = `
      <div class="tide-row"><span class="tide-label">Hull</span><span class="tide-value" data-stat="hull"></span></div>
      <div class="tide-meter"><i data-meter="hull"></i></div>
      <div class="tide-row"><span class="tide-label">Lantern oil</span><span class="tide-value" data-stat="oil"></span></div>
      <div class="tide-meter oil"><i data-meter="oil"></i></div>
      <div class="tide-card"><strong data-stat="biome"></strong><small><span data-stat="shards"></span> Memory Shards · <span data-stat="glimmer"></span> Glimmer</small><small data-stat="contract"></small><div class="tide-actions"><button data-buy="hull">Plate hull · 20</button><button data-buy="oil">Fill oil · 15</button><button data-buy="parry">Widen parry · 30</button></div></div>
      <div id="tide-controls"><kbd>Z</kbd> slash · <kbd>X</kbd> parry · <kbd>C</kbd> salvage</div>
    `;
    document.body.append(this.hud);
    this.toast = document.createElement('div');
    this.toast.id = 'tide-toast';
    document.body.append(this.toast);
    for (const button of this.hud.querySelectorAll('[data-buy]')) button.addEventListener('click', () => this.buy(button.dataset.buy));
  }

  makeSlash() {
    const material = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0, side: THREE.DoubleSide, depthTest: false });
    this.slashMesh = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.025, 8, 24, Math.PI * 1.15), material);
    this.slashMesh.position.set(0, 0.05, -1.3);
    this.slashMesh.rotation.z = -0.5;
    this.slashMesh.renderOrder = 20;
    this.engine.boat.eye.add(this.slashMesh);
  }

  enter(inst) {
    this.realm = inst;
    this.clearEntities();
    this.contract = inst ? { realmId: inst.id, shards: 0, wardens: 0, claimed: false } : null;
    if (inst && !this.progress.visited.includes(inst.id)) {
      this.progress.visited.push(inst.id);
      this.progress.glimmer += 5;
      this.save();
      this.notify(`New waters: ${BIOMES[Math.min(11, this.progress.visited.length - 1)]}`);
    }
    this.nextSpawn = Math.max(this.engine.boat.s + 14, 14);
    this.spawnAhead();
    this.updateHud();
  }

  clearEntities() {
    for (const entity of this.entities) this.group.remove(entity.object);
    this.entities.length = 0;
  }

  spawnAhead() {
    if (!this.realm) return;
    const path = this.realm.path, boat = this.engine.boat;
    while (this.nextSpawn < Math.min(path.length - 5, boat.s + 100)) {
      const enemy = this.nextSpawn % 3 !== 0;
      this.entities.push(enemy ? this.makeEnemy(this.nextSpawn) : this.makeShard(this.nextSpawn));
      this.nextSpawn += 14 + Math.random() * 12;
    }
  }

  makeShard(s) {
    const entity = { kind: 'shard', s, d: (Math.random() * 2 - 1) * 2.4, collected: false };
    const group = new THREE.Group();
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshBasicMaterial({ color: 0x00f5d4 }));
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.33, 16), new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: .42, side: THREE.DoubleSide }));
    halo.rotation.x = Math.PI / 2;
    group.add(core, halo);
    entity.object = group; this.group.add(group);
    return entity;
  }

  makeEnemy(s) {
    const entity = { kind: 'enemy', s, d: (Math.random() * 2 - 1) * 2.5, hp: 2, attack: 1.7 + Math.random() * 1.5, hit: 0 };
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ConeGeometry(.45, 1.25, 5), new THREE.MeshBasicMaterial({ color: 0x0b0e14 }));
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffb703 }));
    eye.position.set(0, .35, -.36); group.add(body, eye);
    entity.object = group; this.group.add(group);
    return entity;
  }

  buy(type) {
    const cost = type === 'hull' ? 20 : type === 'oil' ? 15 : 30;
    if (this.progress.glimmer < cost) return this.notify('Not enough Glimmer');
    this.progress.glimmer -= cost;
    if (type === 'hull') { this.progress.maxHull += 15; this.progress.hull = this.progress.maxHull; }
    if (type === 'oil') { this.progress.maxOil += 20; this.progress.oil = this.progress.maxOil; }
    if (type === 'parry') this.progress.parryLevel++;
    this.save(); this.notify(type === 'parry' ? 'The tide slows around your blade' : 'The boat is reforged');
    this.updateHud();
  }

  attack() {
    if (this.slash > 0) return;
    this.slash = .34;
    const boat = this.engine.boat;
    for (const entity of this.entities) {
      if (entity.kind !== 'enemy' || entity.hp <= 0) continue;
      const ds = entity.s - boat.s, dd = Math.abs(entity.d - boat.d);
      if (ds > -1 && ds < 7 && dd < 2.8) {
        entity.hp--;
        entity.hit = .18;
        if (entity.hp <= 0) {
          this.progress.glimmer += 8;
          if (this.contract) this.contract.wardens++;
          this.notify('River Warden defeated · +8 Glimmer');
          this.checkContract();
        }
      }
    }
    this.progress.oil = clamp(this.progress.oil + 1, 0, this.progress.maxOil);
    this.save();
  }

  parryNow() {
    this.parry = .32 + this.progress.parryLevel * .1;
    for (const entity of this.entities) {
      if (entity.kind !== 'enemy' || entity.hp <= 0) continue;
      const ds = entity.s - this.engine.boat.s, dd = Math.abs(entity.d - this.engine.boat.d);
      if (ds > -1 && ds < 5 && dd < 2.8 && entity.attack < .75) {
        entity.hp = 0; entity.attack = 2.3;
        this.progress.glimmer += 10;
        this.progress.oil = clamp(this.progress.oil + 8, 0, this.progress.maxOil);
        this.notify('Tide-Parry · oil restored');
      }
    }
    this.save();
  }

  salvage() {
    const boat = this.engine.boat;
    const shard = this.entities.find((e) => e.kind === 'shard' && e.s - boat.s > -2 && e.s - boat.s < 4 && Math.abs(e.d - boat.d) < 3);
    if (!shard) return this.notify('No memory answers here');
    shard.collected = true;
    this.progress.shards = Math.min(12, this.progress.shards + 1);
    if (this.contract) this.contract.shards++;
    this.progress.glimmer += 12;
    this.progress.oil = clamp(this.progress.oil - 5, 0, this.progress.maxOil);
    this.notify('Memory Shard recovered · +12 Glimmer');
    this.checkContract();
    this.save();
  }

  checkContract() {
    if (!this.contract || this.contract.claimed) return;
    if (this.contract.shards < 3 || this.contract.wardens < 2) return;
    this.contract.claimed = true;
    this.progress.glimmer += 30;
    this.notify('Realm contract complete · +30 Glimmer');
    this.save();
  }

  update(dt) {
    const input = this.engine.input;
    if (!input.enabled) { this.hud.hidden = true; return; }
    this.hud.hidden = false;
    if (input.take('game-attack')) this.attack();
    if (input.take('game-parry')) this.parryNow();
    if (input.take('game-salvage')) this.salvage();
    this.slash = Math.max(0, this.slash - dt);
    this.parry = Math.max(0, this.parry - dt);
    this.progress.oil = clamp(this.progress.oil - dt * .12, 0, this.progress.maxOil);
    this.spawnAhead();
    const boat = this.engine.boat, path = this.realm && this.realm.path;
    if (path) for (const entity of this.entities) {
      const p = path.at(clamp(entity.s, 0, path.length - .1));
      entity.object.position.set(p.x + p.rx * entity.d, .35 + Math.sin(this.engine.time * 2 + entity.s) * .06, p.z + p.rz * entity.d);
      entity.object.rotation.y = p.heading;
      entity.object.visible = entity.kind === 'shard' ? !entity.collected : entity.hp > 0;
      if (entity.kind === 'shard') entity.object.rotation.z = this.engine.time * 1.5;
      if (entity.kind === 'enemy' && entity.hp > 0) {
        entity.hit = Math.max(0, entity.hit - dt);
        entity.attack -= dt;
        if (entity.attack <= 0 && entity.s - boat.s < 4 && Math.abs(entity.d - boat.d) < 2.8) {
          if (this.parry > 0) this.parryNow();
          else { this.progress.hull = Math.max(0, this.progress.hull - 8); this.notify('The Warden struck your hull'); }
          entity.attack = 2.2;
        }
      }
    }
    this.entities = this.entities.filter((e) => {
      const keep = e.kind === 'shard' ? !e.collected && e.s > boat.s - 8 : e.hp > 0 || e.s > boat.s - 8;
      if (!keep) this.group.remove(e.object);
      return keep;
    });
    this.slashMesh.material.opacity = this.slash > 0 ? this.slash / .34 : 0;
    this.slashMesh.scale.setScalar(1 + (1 - this.slash / .34) * .35);
    this.updateHud();
    if (this.toastTimer > 0 && (this.toastTimer -= dt) <= 0) this.toast.classList.remove('is-on');
  }

  updateHud() {
    if (!this.hud) return;
    const p = this.progress;
    this.hud.querySelector('[data-stat="hull"]').textContent = `${Math.ceil(p.hull)} / ${p.maxHull}`;
    this.hud.querySelector('[data-stat="oil"]').textContent = `${Math.ceil(p.oil)} / ${p.maxOil}`;
    this.hud.querySelector('[data-stat="shards"]').textContent = p.shards;
    this.hud.querySelector('[data-stat="glimmer"]').textContent = p.glimmer;
    this.hud.querySelector('[data-stat="biome"]').textContent = BIOMES[Math.min(11, Math.max(0, p.visited.length - 1))];
    this.hud.querySelector('[data-stat="contract"]').textContent = this.contract
      ? `Contract · ${this.contract.shards}/3 shards · ${this.contract.wardens}/2 Wardens${this.contract.claimed ? ' · complete' : ''}`
      : '';
    this.hud.querySelector('[data-meter="hull"]').style.width = `${(p.hull / p.maxHull) * 100}%`;
    this.hud.querySelector('[data-meter="oil"]').style.width = `${(p.oil / p.maxOil) * 100}%`;
  }

  notify(message) {
    this.toast.textContent = message;
    this.toast.classList.add('is-on');
    this.toastTimer = 2.4;
  }
}
