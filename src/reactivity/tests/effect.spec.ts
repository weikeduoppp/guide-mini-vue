import { effect } from '../effect';
import { reactive } from '../reactive';

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    // update
    user.age++;
    expect(nextAge).toBe(12);
  });

  it('effect runner', () => {
    // effect会返回函数fn, 执行会返回effectFn的值

    let foo = 10;
    const runner = effect(() => {
      foo++;
      return 'foo';
    });

    expect(foo).toBe(11);
    const res = runner();
    expect(foo).toBe(12);
    expect(res).toBe('foo');
  });

  // 实现scheduler
  it('scheduler', () => {
    /**
     * 1. 通过 effect 的第二参数指定scheduler属性(函数)的 fn,
     * 2. effect 第一次还是会执行fn
     * 3. 当响应式 set 更新时不会执行fn, 执行的是scheduler
     * 4. 如果是执行runner, 会再次执行fn
     */
    let run: any;
    let dummy: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({
      foo: 1,
    });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        scheduler,
      }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);

    //
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);

    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(2);
  });
});
