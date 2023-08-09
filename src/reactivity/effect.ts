class ReactiveEffect {
  private _fn: any;
  _scheduler: any;

  constructor(fn, options) {
    this._fn = fn;
    if(options) {
      this._scheduler = options.scheduler
    }
  }
  run() {
    activeEffect = this;
    return this._fn();
  }
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

  dep.add(activeEffect);
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);

  for (const effect of dep) {
    if(effect._scheduler) {
      effect._scheduler()
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
  return _effect.run.bind(_effect)
}
