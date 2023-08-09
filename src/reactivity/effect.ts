import { extend } from '../shared/index';

class ReactiveEffect {
  private _fn: any;
  scheduler: any;
  deps = [];
  active = true;
  onStop?: () => void;
  constructor(fn, options) {
    this._fn = fn;

    if (options) {
      extend(this, options);
      // Object.assign(this, options);
      // this.scheduler = options.scheduler;
    }
  }
  run() {
    activeEffect = this;
    return this._fn();
  }
  // 执行stop
  stop() {
    if (this.active) {
      clearupEffect(this);
      this.onStop?.();
      this.active = false;
    }
  }
}

function clearupEffect(effect) {
  // dep删除依赖effect
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
}

const targetMap = new Map();
export function track(target, key) {
  // target -> key -> dep
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  if (!activeEffect) return;

  // stop后 不添加effect
  if (activeEffect.active) {
    dep.add(activeEffect);
    // fn可以有多个reactive
    activeEffect.deps.push(dep);
  }
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);

  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

let activeEffect;
export function effect(fn: () => any, options?: any) {
  // fn
  const _effect = new ReactiveEffect(fn, options);

  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  // 挂载出去
  runner.effect = _effect;
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
