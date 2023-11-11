(function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	/**
	 * @template T
	 * @template S
	 * @param {T} tar
	 * @param {S} src
	 * @returns {T & S}
	 */
	function assign(tar, src) {
		// @ts-ignore
		for (const k in src) tar[k] = src[k];
		return /** @type {T & S} */ (tar);
	}

	// Adapted from https://github.com/then/is-promise/blob/master/index.js
	// Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
	/**
	 * @param {any} value
	 * @returns {value is PromiseLike<any>}
	 */
	function is_promise(value) {
		return (
			!!value &&
			(typeof value === 'object' || typeof value === 'function') &&
			typeof (/** @type {any} */ (value).then) === 'function'
		);
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	function subscribe(store, ...callbacks) {
		if (store == null) {
			for (const callback of callbacks) {
				callback(undefined);
			}
			return noop;
		}
		const unsub = store.subscribe(...callbacks);
		return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
	}

	/** @returns {void} */
	function component_subscribe(component, store, callback) {
		component.$$.on_destroy.push(subscribe(store, callback));
	}

	function set_store_value(store, ret, value) {
		store.set(value);
		return ret;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {string} style_sheet_id
	 * @param {string} styles
	 * @returns {void}
	 */
	function append_styles(target, style_sheet_id, styles) {
		const append_styles_to = get_root_for_style(target);
		if (!append_styles_to.getElementById(style_sheet_id)) {
			const style = element('style');
			style.id = style_sheet_id;
			style.textContent = styles;
			append_stylesheet(append_styles_to, style);
		}
	}

	/**
	 * @param {Node} node
	 * @returns {ShadowRoot | Document}
	 */
	function get_root_for_style(node) {
		if (!node) return document;
		const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
		if (root && /** @type {ShadowRoot} */ (root).host) {
			return /** @type {ShadowRoot} */ (root);
		}
		return node.ownerDocument;
	}

	/**
	 * @param {ShadowRoot | Document} node
	 * @param {HTMLStyleElement} style
	 * @returns {CSSStyleSheet}
	 */
	function append_stylesheet(node, style) {
		append(/** @type {Document} */ (node).head || node, style);
		return style.sheet;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @returns {(event: any) => any} */
	function prevent_default(fn) {
		return function (event) {
			event.preventDefault();
			// @ts-ignore
			return fn.call(this, event);
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/** @returns {number} */
	function to_number(value) {
		return value === '' ? null : +value;
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data(text, data) {
		data = '' + data;
		if (text.data === data) return;
		text.data = /** @type {string} */ (data);
	}

	/**
	 * @returns {void} */
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}

	function construct_svelte_component(component, props) {
		return new component(props);
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	/**
	 * @template T
	 * @param {Promise<T>} promise
	 * @param {import('./private.js').PromiseInfo<T>} info
	 * @returns {boolean}
	 */
	function handle_promise(promise, info) {
		const token = (info.token = {});
		/**
		 * @param {import('./private.js').FragmentFactory} type
		 * @param {0 | 1 | 2} index
		 * @param {number} [key]
		 * @param {any} [value]
		 * @returns {void}
		 */
		function update(type, index, key, value) {
			if (info.token !== token) return;
			info.resolved = value;
			let child_ctx = info.ctx;
			if (key !== undefined) {
				child_ctx = child_ctx.slice();
				child_ctx[key] = value;
			}
			const block = type && (info.current = type)(child_ctx);
			let needs_flush = false;
			if (info.block) {
				if (info.blocks) {
					info.blocks.forEach((block, i) => {
						if (i !== index && block) {
							group_outros();
							transition_out(block, 1, 1, () => {
								if (info.blocks[i] === block) {
									info.blocks[i] = null;
								}
							});
							check_outros();
						}
					});
				} else {
					info.block.d(1);
				}
				block.c();
				transition_in(block, 1);
				block.m(info.mount(), info.anchor);
				needs_flush = true;
			}
			info.block = block;
			if (info.blocks) info.blocks[index] = block;
			if (needs_flush) {
				flush();
			}
		}
		if (is_promise(promise)) {
			const current_component = get_current_component();
			promise.then(
				(value) => {
					set_current_component(current_component);
					update(info.then, 1, info.value, value);
					set_current_component(null);
				},
				(error) => {
					set_current_component(current_component);
					update(info.catch, 2, info.error, error);
					set_current_component(null);
					if (!info.hasCatch) {
						throw error;
					}
				}
			);
			// if we previously had a then/catch block, destroy it
			if (info.current !== info.pending) {
				update(info.pending, 0);
				return true;
			}
		} else {
			if (info.current !== info.then) {
				update(info.then, 1, info.value, promise);
				return true;
			}
			info.resolved = /** @type {T} */ (promise);
		}
	}

	/** @returns {void} */
	function update_await_block_branch(info, ctx, dirty) {
		const child_ctx = ctx.slice();
		const { resolved } = info;
		if (info.current === info.then) {
			child_ctx[info.value] = resolved;
		}
		if (info.current === info.catch) {
			child_ctx[info.error] = resolved;
		}
		info.block.p(child_ctx, dirty);
	}

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {{}} */
	function get_spread_update(levels, updates) {
		const update = {};
		const to_null_out = {};
		const accounted_for = { $$scope: 1 };
		let i = levels.length;
		while (i--) {
			const o = levels[i];
			const n = updates[i];
			if (n) {
				for (const key in o) {
					if (!(key in n)) to_null_out[key] = 1;
				}
				for (const key in n) {
					if (!accounted_for[key]) {
						update[key] = n[key];
						accounted_for[key] = 1;
					}
				}
				levels[i] = n;
			} else {
				for (const key in o) {
					accounted_for[key] = 1;
				}
			}
		}
		for (const key in to_null_out) {
			if (!(key in update)) update[key] = undefined;
		}
		return update;
	}

	function get_spread_object(spread_props) {
		return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	/** @returns {void} */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				const nodes = children(options.target);
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	const PUBLIC_VERSION = '4';

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	const subscriber_queue = [];

	/**
	 * Create a `Writable` store that allows both updating and reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#writable
	 * @template T
	 * @param {T} [value] initial value
	 * @param {import('./public.js').StartStopNotifier<T>} [start]
	 * @returns {import('./public.js').Writable<T>}
	 */
	function writable(value, start = noop) {
		/** @type {import('./public.js').Unsubscriber} */
		let stop;
		/** @type {Set<import('./private.js').SubscribeInvalidateTuple<T>>} */
		const subscribers = new Set();
		/** @param {T} new_value
		 * @returns {void}
		 */
		function set(new_value) {
			if (safe_not_equal(value, new_value)) {
				value = new_value;
				if (stop) {
					// store is ready
					const run_queue = !subscriber_queue.length;
					for (const subscriber of subscribers) {
						subscriber[1]();
						subscriber_queue.push(subscriber, value);
					}
					if (run_queue) {
						for (let i = 0; i < subscriber_queue.length; i += 2) {
							subscriber_queue[i][0](subscriber_queue[i + 1]);
						}
						subscriber_queue.length = 0;
					}
				}
			}
		}

		/**
		 * @param {import('./public.js').Updater<T>} fn
		 * @returns {void}
		 */
		function update(fn) {
			set(fn(value));
		}

		/**
		 * @param {import('./public.js').Subscriber<T>} run
		 * @param {import('./private.js').Invalidator<T>} [invalidate]
		 * @returns {import('./public.js').Unsubscriber}
		 */
		function subscribe(run, invalidate = noop) {
			/** @type {import('./private.js').SubscribeInvalidateTuple<T>} */
			const subscriber = [run, invalidate];
			subscribers.add(subscriber);
			if (subscribers.size === 1) {
				stop = start(set, update) || noop;
			}
			run(value);
			return () => {
				subscribers.delete(subscriber);
				if (subscribers.size === 0 && stop) {
					stop();
					stop = null;
				}
			};
		}
		return { set, update, subscribe };
	}

	const path = writable(window.location.pathname);
	const user = writable(null);

	function getUsernameCookie() {
	    return localStorage.getItem("username");
	}

	/* src/pages/Signup.svelte generated by Svelte v4.2.0 */

	function create_fragment$8(ctx) {
		let form;
		let div0;
		let label0;
		let t1;
		let input0;
		let t2;
		let div1;
		let label1;
		let t4;
		let input1;
		let t5;
		let div2;
		let label2;
		let t7;
		let input2;
		let t8;
		let div3;
		let label3;
		let t10;
		let input3;
		let t11;
		let div4;
		let label4;
		let t13;
		let input4;
		let t14;
		let div5;
		let label5;
		let t16;
		let input5;
		let t17;
		let input6;
		let t18;
		let button;
		let mounted;
		let dispose;

		return {
			c() {
				form = element("form");
				div0 = element("div");
				label0 = element("label");
				label0.textContent = "Username:";
				t1 = space();
				input0 = element("input");
				t2 = space();
				div1 = element("div");
				label1 = element("label");
				label1.textContent = "Password:";
				t4 = space();
				input1 = element("input");
				t5 = space();
				div2 = element("div");
				label2 = element("label");
				label2.textContent = "Name:";
				t7 = space();
				input2 = element("input");
				t8 = space();
				div3 = element("div");
				label3 = element("label");
				label3.textContent = "Pronouns:";
				t10 = space();
				input3 = element("input");
				t11 = space();
				div4 = element("div");
				label4 = element("label");
				label4.textContent = "Age:";
				t13 = space();
				input4 = element("input");
				t14 = space();
				div5 = element("div");
				label5 = element("label");
				label5.textContent = "Year:";
				t16 = space();
				input5 = element("input");
				t17 = space();
				input6 = element("input");
				t18 = space();
				button = element("button");
				button.textContent = "or log in";
				attr(label0, "for", "username");
				attr(input0, "type", "text");
				input0.required = true;
				attr(input0, "id", "username");
				attr(label1, "for", "password");
				attr(input1, "type", "password");
				input1.required = true;
				attr(input1, "id", "password");
				attr(label2, "for", "name");
				attr(input2, "type", "text");
				input2.required = true;
				attr(input2, "id", "name");
				attr(label3, "for", "pronouns");
				attr(input3, "type", "text");
				input3.required = true;
				attr(input3, "id", "pronouns");
				attr(label4, "for", "age");
				attr(input4, "type", "number");
				attr(input4, "id", "age");
				attr(label5, "for", "year");
				attr(input5, "type", "number");
				attr(input5, "id", "year");
				attr(input6, "type", "submit");
				input6.value = "Sign up";
			},
			m(target, anchor) {
				insert(target, form, anchor);
				append(form, div0);
				append(div0, label0);
				append(div0, t1);
				append(div0, input0);
				set_input_value(input0, /*username*/ ctx[0]);
				append(form, t2);
				append(form, div1);
				append(div1, label1);
				append(div1, t4);
				append(div1, input1);
				set_input_value(input1, /*password*/ ctx[1]);
				append(form, t5);
				append(form, div2);
				append(div2, label2);
				append(div2, t7);
				append(div2, input2);
				set_input_value(input2, /*name*/ ctx[2]);
				append(form, t8);
				append(form, div3);
				append(div3, label3);
				append(div3, t10);
				append(div3, input3);
				set_input_value(input3, /*pronouns*/ ctx[3]);
				append(form, t11);
				append(form, div4);
				append(div4, label4);
				append(div4, t13);
				append(div4, input4);
				set_input_value(input4, /*age*/ ctx[4]);
				append(form, t14);
				append(form, div5);
				append(div5, label5);
				append(div5, t16);
				append(div5, input5);
				set_input_value(input5, /*year*/ ctx[5]);
				append(form, t17);
				append(form, input6);
				append(form, t18);
				append(form, button);

				if (!mounted) {
					dispose = [
						listen(input0, "input", /*input0_input_handler*/ ctx[8]),
						listen(input1, "input", /*input1_input_handler*/ ctx[9]),
						listen(input2, "input", /*input2_input_handler*/ ctx[10]),
						listen(input3, "input", /*input3_input_handler*/ ctx[11]),
						listen(input4, "input", /*input4_input_handler*/ ctx[12]),
						listen(input5, "input", /*input5_input_handler*/ ctx[13]),
						listen(button, "click", /*click_handler*/ ctx[14]),
						listen(form, "submit", prevent_default(/*createUser*/ ctx[7]))
					];

					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
					set_input_value(input0, /*username*/ ctx[0]);
				}

				if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
					set_input_value(input1, /*password*/ ctx[1]);
				}

				if (dirty & /*name*/ 4 && input2.value !== /*name*/ ctx[2]) {
					set_input_value(input2, /*name*/ ctx[2]);
				}

				if (dirty & /*pronouns*/ 8 && input3.value !== /*pronouns*/ ctx[3]) {
					set_input_value(input3, /*pronouns*/ ctx[3]);
				}

				if (dirty & /*age*/ 16 && to_number(input4.value) !== /*age*/ ctx[4]) {
					set_input_value(input4, /*age*/ ctx[4]);
				}

				if (dirty & /*year*/ 32 && to_number(input5.value) !== /*year*/ ctx[5]) {
					set_input_value(input5, /*year*/ ctx[5]);
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(form);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	function instance$7($$self, $$props, $$invalidate) {
		let $path;
		component_subscribe($$self, path, $$value => $$invalidate(6, $path = $$value));
		let username;
		let password;
		let name;
		let pronouns;
		let age;
		let year;

		if (getUsernameCookie()) {
			set_store_value(path, $path = "/dashboard", $path);
		}

		async function createUser() {
			let res = await fetch(`/api/user`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					username,
					password,
					name,
					pronouns,
					age,
					year
				})
			});

			let json = await res.json();

			if (json.success) {
				set_store_value(path, $path = "/login", $path);
			}
		}

		function input0_input_handler() {
			username = this.value;
			$$invalidate(0, username);
		}

		function input1_input_handler() {
			password = this.value;
			$$invalidate(1, password);
		}

		function input2_input_handler() {
			name = this.value;
			$$invalidate(2, name);
		}

		function input3_input_handler() {
			pronouns = this.value;
			$$invalidate(3, pronouns);
		}

		function input4_input_handler() {
			age = to_number(this.value);
			$$invalidate(4, age);
		}

		function input5_input_handler() {
			year = to_number(this.value);
			$$invalidate(5, year);
		}

		const click_handler = () => set_store_value(path, $path = "/login", $path);

		return [
			username,
			password,
			name,
			pronouns,
			age,
			year,
			$path,
			createUser,
			input0_input_handler,
			input1_input_handler,
			input2_input_handler,
			input3_input_handler,
			input4_input_handler,
			input5_input_handler,
			click_handler
		];
	}

	class Signup extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$7, create_fragment$8, safe_not_equal, {});
		}
	}

	/* src/pages/Login.svelte generated by Svelte v4.2.0 */

	function create_fragment$7(ctx) {
		let form;
		let div0;
		let label0;
		let t1;
		let input0;
		let t2;
		let div1;
		let label1;
		let t4;
		let input1;
		let t5;
		let input2;
		let t6;
		let button;
		let mounted;
		let dispose;

		return {
			c() {
				form = element("form");
				div0 = element("div");
				label0 = element("label");
				label0.textContent = "Username:";
				t1 = space();
				input0 = element("input");
				t2 = space();
				div1 = element("div");
				label1 = element("label");
				label1.textContent = "Password:";
				t4 = space();
				input1 = element("input");
				t5 = space();
				input2 = element("input");
				t6 = space();
				button = element("button");
				button.textContent = "or sign up";
				attr(label0, "for", "username");
				attr(input0, "type", "text");
				input0.required = true;
				attr(input0, "id", "username");
				attr(label1, "for", "password");
				attr(input1, "type", "password");
				input1.required = true;
				attr(input1, "id", "password");
				attr(input2, "type", "submit");
				input2.value = "Log in";
			},
			m(target, anchor) {
				insert(target, form, anchor);
				append(form, div0);
				append(div0, label0);
				append(div0, t1);
				append(div0, input0);
				set_input_value(input0, /*username*/ ctx[0]);
				append(form, t2);
				append(form, div1);
				append(div1, label1);
				append(div1, t4);
				append(div1, input1);
				set_input_value(input1, /*password*/ ctx[1]);
				append(form, t5);
				append(form, input2);
				append(form, t6);
				append(form, button);

				if (!mounted) {
					dispose = [
						listen(input0, "input", /*input0_input_handler*/ ctx[4]),
						listen(input1, "input", /*input1_input_handler*/ ctx[5]),
						listen(button, "click", /*click_handler*/ ctx[6]),
						listen(form, "submit", prevent_default(/*login*/ ctx[3]))
					];

					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
					set_input_value(input0, /*username*/ ctx[0]);
				}

				if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
					set_input_value(input1, /*password*/ ctx[1]);
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(form);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	function instance$6($$self, $$props, $$invalidate) {
		let $path;
		component_subscribe($$self, path, $$value => $$invalidate(2, $path = $$value));
		let username;
		let password;

		if (getUsernameCookie()) {
			set_store_value(path, $path = "/dashboard", $path);
		}

		async function login() {
			let res = await fetch("/api/login", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ username, password })
			});

			let json = await res.json();

			if ("error" in json) {
				alert("Error: " + json["error"]);
				return;
			}

			if ("username" in json) {
				localStorage.setItem("username", json["username"]);
				set_store_value(path, $path = "/dashboard", $path);
			}
		}

		function input0_input_handler() {
			username = this.value;
			$$invalidate(0, username);
		}

		function input1_input_handler() {
			password = this.value;
			$$invalidate(1, password);
		}

		const click_handler = () => set_store_value(path, $path = "/signup", $path);

		return [
			username,
			password,
			$path,
			login,
			input0_input_handler,
			input1_input_handler,
			click_handler
		];
	}

	class Login extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$6, create_fragment$7, safe_not_equal, {});
		}
	}

	/* src/components/LoggedInBar.svelte generated by Svelte v4.2.0 */

	function create_catch_block$1(ctx) {
		return { c: noop, m: noop, p: noop, d: noop };
	}

	// (22:1) {:then}
	function create_then_block$1(ctx) {
		let t0;
		let t1_value = /*$user*/ ctx[1].name + "";
		let t1;

		return {
			c() {
				t0 = text("Hello, ");
				t1 = text(t1_value);
			},
			m(target, anchor) {
				insert(target, t0, anchor);
				insert(target, t1, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*$user*/ 2 && t1_value !== (t1_value = /*$user*/ ctx[1].name + "")) set_data(t1, t1_value);
			},
			d(detaching) {
				if (detaching) {
					detach(t0);
					detach(t1);
				}
			}
		};
	}

	// (20:18)    Loading user…  {:then}
	function create_pending_block$1(ctx) {
		let t;

		return {
			c() {
				t = text("Loading user…");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	function create_fragment$6(ctx) {
		let div;
		let t0;
		let button0;
		let t2;
		let button1;
		let t4;
		let button2;
		let mounted;
		let dispose;

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: false,
			pending: create_pending_block$1,
			then: create_then_block$1,
			catch: create_catch_block$1
		};

		handle_promise(/*info_pms*/ ctx[2], info);

		return {
			c() {
				div = element("div");
				info.block.c();
				t0 = space();
				button0 = element("button");
				button0.textContent = "Dashboard";
				t2 = space();
				button1 = element("button");
				button1.textContent = "Settings";
				t4 = space();
				button2 = element("button");
				button2.textContent = "Log out";
			},
			m(target, anchor) {
				insert(target, div, anchor);
				info.block.m(div, info.anchor = null);
				info.mount = () => div;
				info.anchor = t0;
				append(div, t0);
				append(div, button0);
				append(div, t2);
				append(div, button1);
				append(div, t4);
				append(div, button2);

				if (!mounted) {
					dispose = [
						listen(button0, "click", /*click_handler*/ ctx[4]),
						listen(button1, "click", /*click_handler_1*/ ctx[5]),
						listen(button2, "click", /*logOut*/ ctx[3])
					];

					mounted = true;
				}
			},
			p(new_ctx, [dirty]) {
				ctx = new_ctx;
				update_await_block_branch(info, ctx, dirty);
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				info.block.d();
				info.token = null;
				info = null;
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function instance$5($$self, $$props, $$invalidate) {
		let $path;
		let $user;
		component_subscribe($$self, path, $$value => $$invalidate(0, $path = $$value));
		component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
		let username = localStorage.getItem("username");

		if (!username) {
			logOut();
		}

		let info_pms = fetch("/api/user/me").then(res => res.json()).then(json => {
			set_store_value(user, $user = json, $user);
		}).catch(logOut);

		async function logOut() {
			await fetch("/api/logout");
			localStorage.removeItem("username");
			set_store_value(path, $path = "/", $path);
		}

		const click_handler = () => set_store_value(path, $path = "/dashboard", $path);
		const click_handler_1 = () => set_store_value(path, $path = "/settings", $path);
		return [$path, $user, info_pms, logOut, click_handler, click_handler_1];
	}

	class LoggedInBar extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$5, create_fragment$6, safe_not_equal, {});
		}
	}

	/* src/pages/Dashboard.svelte generated by Svelte v4.2.0 */

	function add_css(target) {
		append_styles(target, "svelte-pqyj29", "#calendar.svelte-pqyj29{width:100%}");
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[29] = list[i];
		return child_ctx;
	}

	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[32] = list[i];
		return child_ctx;
	}

	function get_each_context_2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[35] = list[i];
		return child_ctx;
	}

	// (127:0) {#if $user}
	function create_if_block_2(ctx) {
		let h2;
		let t0;
		let t1_value = /*$user*/ ctx[8].name + "";
		let t1;
		let t2;
		let if_block = /*$user*/ ctx[8].pronouns && create_if_block_3(ctx);

		return {
			c() {
				h2 = element("h2");
				t0 = text("Hello, ");
				t1 = text(t1_value);
				t2 = space();
				if (if_block) if_block.c();
			},
			m(target, anchor) {
				insert(target, h2, anchor);
				append(h2, t0);
				append(h2, t1);
				append(h2, t2);
				if (if_block) if_block.m(h2, null);
			},
			p(ctx, dirty) {
				if (dirty[0] & /*$user*/ 256 && t1_value !== (t1_value = /*$user*/ ctx[8].name + "")) set_data(t1, t1_value);

				if (/*$user*/ ctx[8].pronouns) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block_3(ctx);
						if_block.c();
						if_block.m(h2, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},
			d(detaching) {
				if (detaching) {
					detach(h2);
				}

				if (if_block) if_block.d();
			}
		};
	}

	// (130:2) {#if $user.pronouns}
	function create_if_block_3(ctx) {
		let t0;
		let t1_value = /*$user*/ ctx[8].pronouns + "";
		let t1;
		let t2;

		return {
			c() {
				t0 = text("(");
				t1 = text(t1_value);
				t2 = text(")");
			},
			m(target, anchor) {
				insert(target, t0, anchor);
				insert(target, t1, anchor);
				insert(target, t2, anchor);
			},
			p(ctx, dirty) {
				if (dirty[0] & /*$user*/ 256 && t1_value !== (t1_value = /*$user*/ ctx[8].pronouns + "")) set_data(t1, t1_value);
			},
			d(detaching) {
				if (detaching) {
					detach(t0);
					detach(t1);
					detach(t2);
				}
			}
		};
	}

	// (175:8) {#if day.month}
	function create_if_block_1(ctx) {
		let t_value = /*day*/ ctx[32].month + "";
		let t;

		return {
			c() {
				t = text(t_value);
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			p(ctx, dirty) {
				if (dirty[0] & /*weeks*/ 2 && t_value !== (t_value = /*day*/ ctx[32].month + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (180:7) {#each day.events as evt}
	function create_each_block_2(ctx) {
		let li;
		let h5;
		let t0_value = /*evt*/ ctx[35].eventName + "";
		let t0;
		let t1;
		let t2_value = /*evt*/ ctx[35].owner + "";
		let t2;
		let t3;
		let t4;
		let button0;
		let t6;
		let button1;
		let t8;
		let button2;
		let t10;
		let div;
		let t11_value = new Date(/*evt*/ ctx[35].start).toLocaleString("default", { hour: "numeric", minute: "numeric" }) + "";
		let t11;
		let t12;
		let t13_value = new Date(/*evt*/ ctx[35].end).toLocaleString("default", { hour: "numeric", minute: "numeric" }) + "";
		let t13;
		let mounted;
		let dispose;

		function click_handler_3() {
			return /*click_handler_3*/ ctx[19](/*evt*/ ctx[35]);
		}

		function click_handler_4() {
			return /*click_handler_4*/ ctx[20](/*evt*/ ctx[35]);
		}

		function click_handler_5() {
			return /*click_handler_5*/ ctx[21](/*evt*/ ctx[35]);
		}

		return {
			c() {
				li = element("li");
				h5 = element("h5");
				t0 = text(t0_value);
				t1 = text(" (");
				t2 = text(t2_value);
				t3 = text(")");
				t4 = space();
				button0 = element("button");
				button0.textContent = "View";
				t6 = space();
				button1 = element("button");
				button1.textContent = "Edit";
				t8 = space();
				button2 = element("button");
				button2.textContent = "Delete";
				t10 = space();
				div = element("div");
				t11 = text(t11_value);
				t12 = text("—");
				t13 = text(t13_value);
			},
			m(target, anchor) {
				insert(target, li, anchor);
				append(li, h5);
				append(h5, t0);
				append(h5, t1);
				append(h5, t2);
				append(h5, t3);
				append(li, t4);
				append(li, button0);
				append(li, t6);
				append(li, button1);
				append(li, t8);
				append(li, button2);
				append(li, t10);
				append(li, div);
				append(div, t11);
				append(div, t12);
				append(div, t13);

				if (!mounted) {
					dispose = [
						listen(button0, "click", click_handler_3),
						listen(button1, "click", click_handler_4),
						listen(button2, "click", click_handler_5)
					];

					mounted = true;
				}
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty[0] & /*weeks*/ 2 && t0_value !== (t0_value = /*evt*/ ctx[35].eventName + "")) set_data(t0, t0_value);
				if (dirty[0] & /*weeks*/ 2 && t2_value !== (t2_value = /*evt*/ ctx[35].owner + "")) set_data(t2, t2_value);
				if (dirty[0] & /*weeks*/ 2 && t11_value !== (t11_value = new Date(/*evt*/ ctx[35].start).toLocaleString("default", { hour: "numeric", minute: "numeric" }) + "")) set_data(t11, t11_value);
				if (dirty[0] & /*weeks*/ 2 && t13_value !== (t13_value = new Date(/*evt*/ ctx[35].end).toLocaleString("default", { hour: "numeric", minute: "numeric" }) + "")) set_data(t13, t13_value);
			},
			d(detaching) {
				if (detaching) {
					detach(li);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (171:4) {#each week as day}
	function create_each_block_1(ctx) {
		let td;
		let h4;
		let button;
		let t0;
		let t1_value = /*day*/ ctx[32].day + "";
		let t1;
		let t2;
		let ul;
		let mounted;
		let dispose;
		let if_block = /*day*/ ctx[32].month && create_if_block_1(ctx);

		function click_handler_2() {
			return /*click_handler_2*/ ctx[18](/*day*/ ctx[32]);
		}

		let each_value_2 = ensure_array_like(/*day*/ ctx[32].events);
		let each_blocks = [];

		for (let i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
		}

		return {
			c() {
				td = element("td");
				h4 = element("h4");
				button = element("button");
				if (if_block) if_block.c();
				t0 = space();
				t1 = text(t1_value);
				t2 = space();
				ul = element("ul");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
			},
			m(target, anchor) {
				insert(target, td, anchor);
				append(td, h4);
				append(h4, button);
				if (if_block) if_block.m(button, null);
				append(button, t0);
				append(button, t1);
				append(td, t2);
				append(td, ul);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(ul, null);
					}
				}

				if (!mounted) {
					dispose = listen(button, "click", click_handler_2);
					mounted = true;
				}
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;

				if (/*day*/ ctx[32].month) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block_1(ctx);
						if_block.c();
						if_block.m(button, t0);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (dirty[0] & /*weeks*/ 2 && t1_value !== (t1_value = /*day*/ ctx[32].day + "")) set_data(t1, t1_value);

				if (dirty[0] & /*weeks, deleteEvent, $path*/ 4610) {
					each_value_2 = ensure_array_like(/*day*/ ctx[32].events);
					let i;

					for (i = 0; i < each_value_2.length; i += 1) {
						const child_ctx = get_each_context_2(ctx, each_value_2, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block_2(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(ul, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value_2.length;
				}
			},
			d(detaching) {
				if (detaching) {
					detach(td);
				}

				if (if_block) if_block.d();
				destroy_each(each_blocks, detaching);
				mounted = false;
				dispose();
			}
		};
	}

	// (169:2) {#each weeks as week}
	function create_each_block(ctx) {
		let tr;
		let t;
		let each_value_1 = ensure_array_like(/*week*/ ctx[29]);
		let each_blocks = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
		}

		return {
			c() {
				tr = element("tr");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t = space();
			},
			m(target, anchor) {
				insert(target, tr, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(tr, null);
					}
				}

				append(tr, t);
			},
			p(ctx, dirty) {
				if (dirty[0] & /*weeks, deleteEvent, $path, select*/ 5634) {
					each_value_1 = ensure_array_like(/*week*/ ctx[29]);
					let i;

					for (i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block_1(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(tr, t);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value_1.length;
				}
			},
			d(detaching) {
				if (detaching) {
					detach(tr);
				}

				destroy_each(each_blocks, detaching);
			}
		};
	}

	// (230:1) {#if showPopup}
	function create_if_block$2(ctx) {
		let div5;
		let form;
		let div0;
		let label0;
		let t1;
		let input0;
		let t2;
		let div1;
		let label1;
		let t4;
		let input1;
		let t5;
		let div2;
		let label2;
		let t7;
		let input2;
		let t8;
		let div3;
		let label3;
		let t10;
		let input3;
		let t11;
		let div4;
		let label4;
		let t13;
		let input4;
		let t14;
		let input5;
		let mounted;
		let dispose;

		return {
			c() {
				div5 = element("div");
				form = element("form");
				div0 = element("div");
				label0 = element("label");
				label0.textContent = "Name:";
				t1 = space();
				input0 = element("input");
				t2 = space();
				div1 = element("div");
				label1 = element("label");
				label1.textContent = "Time:";
				t4 = space();
				input1 = element("input");
				t5 = space();
				div2 = element("div");
				label2 = element("label");
				label2.textContent = "Time:";
				t7 = space();
				input2 = element("input");
				t8 = space();
				div3 = element("div");
				label3 = element("label");
				label3.textContent = "Latitude:";
				t10 = space();
				input3 = element("input");
				t11 = space();
				div4 = element("div");
				label4 = element("label");
				label4.textContent = "Longitude:";
				t13 = space();
				input4 = element("input");
				t14 = space();
				input5 = element("input");
				attr(label0, "for", "name");
				attr(input0, "type", "text");
				attr(input0, "id", "name");
				attr(label1, "for", "start");
				attr(input1, "type", "time");
				attr(input1, "id", "start");
				attr(label2, "for", "end");
				attr(input2, "type", "time");
				attr(input2, "id", "end");
				attr(label3, "for", "lat");
				attr(input3, "type", "number");
				attr(input3, "id", "lat");
				attr(input3, "step", "any");
				attr(label4, "for", "lon");
				attr(input4, "type", "number");
				attr(input4, "id", "lon");
				attr(input4, "step", "any");
				attr(input5, "type", "submit");
				input5.value = "Create";
				attr(div5, "id", "popup");
			},
			m(target, anchor) {
				insert(target, div5, anchor);
				append(div5, form);
				append(form, div0);
				append(div0, label0);
				append(div0, t1);
				append(div0, input0);
				set_input_value(input0, /*name*/ ctx[3]);
				append(form, t2);
				append(form, div1);
				append(div1, label1);
				append(div1, t4);
				append(div1, input1);
				set_input_value(input1, /*start_time*/ ctx[6]);
				append(form, t5);
				append(form, div2);
				append(div2, label2);
				append(div2, t7);
				append(div2, input2);
				set_input_value(input2, /*end_time*/ ctx[7]);
				append(form, t8);
				append(form, div3);
				append(div3, label3);
				append(div3, t10);
				append(div3, input3);
				set_input_value(input3, /*location_lat*/ ctx[4]);
				append(form, t11);
				append(form, div4);
				append(div4, label4);
				append(div4, t13);
				append(div4, input4);
				set_input_value(input4, /*location_lon*/ ctx[5]);
				append(form, t14);
				append(form, input5);

				if (!mounted) {
					dispose = [
						listen(input0, "input", /*input0_input_handler*/ ctx[23]),
						listen(input1, "input", /*input1_input_handler*/ ctx[24]),
						listen(input2, "input", /*input2_input_handler*/ ctx[25]),
						listen(input3, "input", /*input3_input_handler*/ ctx[26]),
						listen(input4, "input", /*input4_input_handler*/ ctx[27]),
						listen(form, "submit", prevent_default(/*addEvent*/ ctx[11]))
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty[0] & /*name*/ 8 && input0.value !== /*name*/ ctx[3]) {
					set_input_value(input0, /*name*/ ctx[3]);
				}

				if (dirty[0] & /*start_time*/ 64) {
					set_input_value(input1, /*start_time*/ ctx[6]);
				}

				if (dirty[0] & /*end_time*/ 128) {
					set_input_value(input2, /*end_time*/ ctx[7]);
				}

				if (dirty[0] & /*location_lat*/ 16 && to_number(input3.value) !== /*location_lat*/ ctx[4]) {
					set_input_value(input3, /*location_lat*/ ctx[4]);
				}

				if (dirty[0] & /*location_lon*/ 32 && to_number(input4.value) !== /*location_lon*/ ctx[5]) {
					set_input_value(input4, /*location_lon*/ ctx[5]);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(div5);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	function create_fragment$5(ctx) {
		let loggedinbar;
		let t0;
		let t1;
		let h30;
		let button0;
		let t3;
		let t4_value = /*selected*/ ctx[0].toLocaleString("default", { month: "long" }) + "";
		let t4;
		let t5;
		let button1;
		let t7;
		let table;
		let thead;
		let t21;
		let tbody;
		let t22;
		let div;
		let h31;
		let t23_value = /*selected*/ ctx[0].toLocaleDateString("default", { month: "long", day: "numeric" }) + "";
		let t23;
		let t24;
		let button2;
		let t25;
		let t26;
		let current;
		let mounted;
		let dispose;
		loggedinbar = new LoggedInBar({});
		let if_block0 = /*$user*/ ctx[8] && create_if_block_2(ctx);
		let each_value = ensure_array_like(/*weeks*/ ctx[1]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		let if_block1 = /*showPopup*/ ctx[2] && create_if_block$2(ctx);

		return {
			c() {
				create_component(loggedinbar.$$.fragment);
				t0 = space();
				if (if_block0) if_block0.c();
				t1 = space();
				h30 = element("h3");
				button0 = element("button");
				button0.textContent = "←";
				t3 = space();
				t4 = text(t4_value);
				t5 = space();
				button1 = element("button");
				button1.textContent = "→";
				t7 = space();
				table = element("table");
				thead = element("thead");
				thead.innerHTML = `<th>Sun</th> <th>Mon</th> <th>Tue</th> <th>Wed</th> <th>Thu</th> <th>Fri</th> <th>Sat</th>`;
				t21 = space();
				tbody = element("tbody");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t22 = space();
				div = element("div");
				h31 = element("h3");
				t23 = text(t23_value);
				t24 = space();
				button2 = element("button");
				t25 = text("+");
				t26 = space();
				if (if_block1) if_block1.c();
				attr(table, "id", "calendar");
				attr(table, "class", "svelte-pqyj29");
				button2.disabled = /*showPopup*/ ctx[2];
			},
			m(target, anchor) {
				mount_component(loggedinbar, target, anchor);
				insert(target, t0, anchor);
				if (if_block0) if_block0.m(target, anchor);
				insert(target, t1, anchor);
				insert(target, h30, anchor);
				append(h30, button0);
				append(h30, t3);
				append(h30, t4);
				append(h30, t5);
				append(h30, button1);
				insert(target, t7, anchor);
				insert(target, table, anchor);
				append(table, thead);
				append(table, t21);
				append(table, tbody);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(tbody, null);
					}
				}

				insert(target, t22, anchor);
				insert(target, div, anchor);
				append(div, h31);
				append(h31, t23);
				append(h31, t24);
				append(h31, button2);
				append(button2, t25);
				append(div, t26);
				if (if_block1) if_block1.m(div, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen(button0, "click", /*click_handler*/ ctx[16]),
						listen(button1, "click", /*click_handler_1*/ ctx[17]),
						listen(button2, "click", /*click_handler_6*/ ctx[22])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (/*$user*/ ctx[8]) {
					if (if_block0) {
						if_block0.p(ctx, dirty);
					} else {
						if_block0 = create_if_block_2(ctx);
						if_block0.c();
						if_block0.m(t1.parentNode, t1);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if ((!current || dirty[0] & /*selected*/ 1) && t4_value !== (t4_value = /*selected*/ ctx[0].toLocaleString("default", { month: "long" }) + "")) set_data(t4, t4_value);

				if (dirty[0] & /*weeks, deleteEvent, $path, select*/ 5634) {
					each_value = ensure_array_like(/*weeks*/ ctx[1]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(tbody, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if ((!current || dirty[0] & /*selected*/ 1) && t23_value !== (t23_value = /*selected*/ ctx[0].toLocaleDateString("default", { month: "long", day: "numeric" }) + "")) set_data(t23, t23_value);

				if (!current || dirty[0] & /*showPopup*/ 4) {
					button2.disabled = /*showPopup*/ ctx[2];
				}

				if (/*showPopup*/ ctx[2]) {
					if (if_block1) {
						if_block1.p(ctx, dirty);
					} else {
						if_block1 = create_if_block$2(ctx);
						if_block1.c();
						if_block1.m(div, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}
			},
			i(local) {
				if (current) return;
				transition_in(loggedinbar.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(loggedinbar.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t0);
					detach(t1);
					detach(h30);
					detach(t7);
					detach(table);
					detach(t22);
					detach(div);
				}

				destroy_component(loggedinbar, detaching);
				if (if_block0) if_block0.d(detaching);
				destroy_each(each_blocks, detaching);
				if (if_block1) if_block1.d();
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function instance$4($$self, $$props, $$invalidate) {
		let $user;
		let $path;
		component_subscribe($$self, user, $$value => $$invalidate(8, $user = $$value));
		component_subscribe($$self, path, $$value => $$invalidate(9, $path = $$value));
		let selected = new Date();
		selected.setHours(0);
		selected.setMinutes(0);
		selected.setSeconds(0);
		selected.setMilliseconds(0);
		selected = selected;
		let events;
		let showPopup = false;
		let weeks = [];
		let start;
		let end;

		async function updateCalendar(date) {
			$$invalidate(1, weeks = []);
			let week = [];
			let first = new Date(date);
			first.setDate(1);
			let prevs = first.getDay();
			let buffer;

			while (prevs > 0) {
				buffer = new Date(first.getTime() - 86400 * 1000 * prevs);

				week.push({
					month: buffer.toLocaleDateString("default", { month: "short" }),
					day: buffer.getDate(),
					events: [],
					date: buffer
				});

				prevs--;
			}

			$$invalidate(14, start = buffer);
			buffer = new Date(first);

			while (buffer.getMonth() == first.getMonth()) {
				week.push({
					day: buffer.getDate(),
					events: [],
					date: buffer
				});

				buffer = new Date(buffer.getTime() + 86400 * 1000);

				if (week.length === 7) {
					weeks.push(week);
					week = [];
				}
			}

			if (week.length > 0) {
				while (week.length < 7) {
					week.push({
						month: buffer.toLocaleDateString("default", { month: "short" }),
						day: buffer.getDate(),
						events: [],
						date: buffer
					});

					buffer = new Date(buffer.getTime() + 86400 * 1000);
				}

				weeks.push(week);
			}

			$$invalidate(15, end = buffer);
		}

		fetch(`/api/user/me/events`).then(res => res.json()).then(evt => {
			$$invalidate(13, events = evt);
		});

		function select(day) {
			$$invalidate(0, selected = day.date);
		}

		let name;
		let location_lat;
		let location_lon;
		let start_time = "";
		let end_time = "";

		async function addEvent() {
			let res = await fetch(`/api/event`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					name,
					start: selected.getTime() + Number.parseInt(start_time.split(":")[0]) * 60 * 60 * 1000 + Number.parseInt(start_time.split(":")[1]) * 60 * 1000,
					end: selected.getTime() + Number.parseInt(end_time.split(":")[0]) * 60 * 60 * 1000 + Number.parseInt(end_time.split(":")[1]) * 60 * 1000,
					location_lat,
					location_lon
				})
			});

			let evt = await res.json();
			$$invalidate(13, events = [...events, evt]);
			$$invalidate(2, showPopup = false);
		}

		async function deleteEvent(evt) {
			if (!confirm("Are you sure you want to delete this event?")) return;
			await fetch(`/api/event/${evt.id}`, { method: "DELETE" });
			$$invalidate(13, events = events.filter(e => e != evt));
		}

		const click_handler = () => {
			selected.setDate(1);

			if (selected.getMonth() === 0) {
				selected.setFullYear(selected.getFullYear() - 1);
			}

			selected.setMonth((selected.getMonth() + 11) % 12);
			$$invalidate(0, selected);
		};

		const click_handler_1 = () => {
			selected.setDate(1);

			if (selected.getMonth() === 11) {
				selected.setFullYear(selected.getFullYear() + 1);
			}

			selected.setMonth((selected.getMonth() + 1) % 12);
			$$invalidate(0, selected);
		};

		const click_handler_2 = day => select(day);
		const click_handler_3 = evt => set_store_value(path, $path = `/event/${evt.id}`, $path);
		const click_handler_4 = evt => set_store_value(path, $path = `/event/${evt.id}/edit`, $path);
		const click_handler_5 = evt => deleteEvent(evt);
		const click_handler_6 = () => $$invalidate(2, showPopup = true);

		function input0_input_handler() {
			name = this.value;
			$$invalidate(3, name);
		}

		function input1_input_handler() {
			start_time = this.value;
			$$invalidate(6, start_time);
		}

		function input2_input_handler() {
			end_time = this.value;
			$$invalidate(7, end_time);
		}

		function input3_input_handler() {
			location_lat = to_number(this.value);
			$$invalidate(4, location_lat);
		}

		function input4_input_handler() {
			location_lon = to_number(this.value);
			$$invalidate(5, location_lon);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty[0] & /*events*/ 8192) {
				console.dir(events);
			}

			if ($$self.$$.dirty[0] & /*events, weeks, start, end*/ 57346) {
				if (events) {
					for (const week of weeks) {
						for (const day of week) {
							day.events = [];
						}
					}

					for (const evt of events) {
						if (evt.start <= start.getTime() || evt.start >= end.getTime()) continue;

						for (const week of weeks) {
							for (const day of week) {
								if (evt.start >= day.date.getTime() && evt.start < day.date.getTime() + 86400 * 1000) {
									day.events = [...day.events, evt];
								}
							}
						}
					}

					((($$invalidate(1, weeks), $$invalidate(13, events)), $$invalidate(14, start)), $$invalidate(15, end));
				}
			}

			if ($$self.$$.dirty[0] & /*selected*/ 1) {
				updateCalendar(selected);
			}
		};

		return [
			selected,
			weeks,
			showPopup,
			name,
			location_lat,
			location_lon,
			start_time,
			end_time,
			$user,
			$path,
			select,
			addEvent,
			deleteEvent,
			events,
			start,
			end,
			click_handler,
			click_handler_1,
			click_handler_2,
			click_handler_3,
			click_handler_4,
			click_handler_5,
			click_handler_6,
			input0_input_handler,
			input1_input_handler,
			input2_input_handler,
			input3_input_handler,
			input4_input_handler
		];
	}

	class Dashboard extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$4, create_fragment$5, safe_not_equal, {}, add_css, [-1, -1]);
		}
	}

	/* src/pages/Settings.svelte generated by Svelte v4.2.0 */

	function create_if_block$1(ctx) {
		let form;
		let div0;
		let label0;
		let t1;
		let input0;
		let t2;
		let div1;
		let label1;
		let t4;
		let input1;
		let t5;
		let div2;
		let label2;
		let t7;
		let input2;
		let t8;
		let div3;
		let label3;
		let t10;
		let input3;
		let t11;
		let input4;
		let mounted;
		let dispose;

		return {
			c() {
				form = element("form");
				div0 = element("div");
				label0 = element("label");
				label0.textContent = "Name:";
				t1 = space();
				input0 = element("input");
				t2 = space();
				div1 = element("div");
				label1 = element("label");
				label1.textContent = "Pronouns:";
				t4 = space();
				input1 = element("input");
				t5 = space();
				div2 = element("div");
				label2 = element("label");
				label2.textContent = "Age:";
				t7 = space();
				input2 = element("input");
				t8 = space();
				div3 = element("div");
				label3 = element("label");
				label3.textContent = "Year:";
				t10 = space();
				input3 = element("input");
				t11 = space();
				input4 = element("input");
				attr(label0, "for", "name");
				attr(input0, "type", "text");
				attr(input0, "id", "name");
				input0.required = true;
				attr(label1, "for", "pronouns");
				attr(input1, "type", "text");
				attr(input1, "id", "pronouns");
				attr(label2, "for", "age");
				attr(input2, "type", "text");
				attr(input2, "id", "age");
				attr(label3, "for", "year");
				attr(input3, "type", "text");
				attr(input3, "id", "year");
				attr(input4, "type", "submit");
				input4.value = "Update";
			},
			m(target, anchor) {
				insert(target, form, anchor);
				append(form, div0);
				append(div0, label0);
				append(div0, t1);
				append(div0, input0);
				set_input_value(input0, /*name*/ ctx[1]);
				append(form, t2);
				append(form, div1);
				append(div1, label1);
				append(div1, t4);
				append(div1, input1);
				set_input_value(input1, /*pronouns*/ ctx[2]);
				append(form, t5);
				append(form, div2);
				append(div2, label2);
				append(div2, t7);
				append(div2, input2);
				set_input_value(input2, /*age*/ ctx[3]);
				append(form, t8);
				append(form, div3);
				append(div3, label3);
				append(div3, t10);
				append(div3, input3);
				set_input_value(input3, /*year*/ ctx[4]);
				append(form, t11);
				append(form, input4);

				if (!mounted) {
					dispose = [
						listen(input0, "input", /*input0_input_handler*/ ctx[6]),
						listen(input1, "input", /*input1_input_handler*/ ctx[7]),
						listen(input2, "input", /*input2_input_handler*/ ctx[8]),
						listen(input3, "input", /*input3_input_handler*/ ctx[9]),
						listen(form, "submit", prevent_default(/*update*/ ctx[5]))
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*name*/ 2 && input0.value !== /*name*/ ctx[1]) {
					set_input_value(input0, /*name*/ ctx[1]);
				}

				if (dirty & /*pronouns*/ 4 && input1.value !== /*pronouns*/ ctx[2]) {
					set_input_value(input1, /*pronouns*/ ctx[2]);
				}

				if (dirty & /*age*/ 8 && input2.value !== /*age*/ ctx[3]) {
					set_input_value(input2, /*age*/ ctx[3]);
				}

				if (dirty & /*year*/ 16 && input3.value !== /*year*/ ctx[4]) {
					set_input_value(input3, /*year*/ ctx[4]);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(form);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	function create_fragment$4(ctx) {
		let loggedinbar;
		let t;
		let if_block_anchor;
		let current;
		loggedinbar = new LoggedInBar({});
		let if_block = /*$user*/ ctx[0] && create_if_block$1(ctx);

		return {
			c() {
				create_component(loggedinbar.$$.fragment);
				t = space();
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			m(target, anchor) {
				mount_component(loggedinbar, target, anchor);
				insert(target, t, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				if (/*$user*/ ctx[0]) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block$1(ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},
			i(local) {
				if (current) return;
				transition_in(loggedinbar.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(loggedinbar.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t);
					detach(if_block_anchor);
				}

				destroy_component(loggedinbar, detaching);
				if (if_block) if_block.d(detaching);
			}
		};
	}

	function instance$3($$self, $$props, $$invalidate) {
		let $user;
		component_subscribe($$self, user, $$value => $$invalidate(0, $user = $$value));
		let name;
		let pronouns;
		let age;
		let year;

		function upd8(u) {
			if (u) {
				$$invalidate(1, name = u.name);
				$$invalidate(2, pronouns = u.pronouns);
				$$invalidate(3, age = u.age);
				$$invalidate(4, year = u.year);
			}
		}

		async function update() {
			let res = await fetch("/api/user", {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ name, pronouns, age, year })
			});

			set_store_value(user, $user = await res.json(), $user);
		}

		function input0_input_handler() {
			name = this.value;
			$$invalidate(1, name);
		}

		function input1_input_handler() {
			pronouns = this.value;
			$$invalidate(2, pronouns);
		}

		function input2_input_handler() {
			age = this.value;
			$$invalidate(3, age);
		}

		function input3_input_handler() {
			year = this.value;
			$$invalidate(4, year);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*$user*/ 1) {
				upd8($user);
			}
		};

		return [
			$user,
			name,
			pronouns,
			age,
			year,
			update,
			input0_input_handler,
			input1_input_handler,
			input2_input_handler,
			input3_input_handler
		];
	}

	class Settings extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$3, create_fragment$4, safe_not_equal, {});
		}
	}

	/* src/pages/Event.svelte generated by Svelte v4.2.0 */

	function create_catch_block(ctx) {
		return { c: noop, m: noop, p: noop, d: noop };
	}

	// (82:0) {:then _}
	function create_then_block(ctx) {
		let h2;
		let t0;
		let t1;
		let button0;
		let t3;
		let button1;
		let t5;
		let h3;
		let t6;
		let t7;
		let t8;
		let h4;
		let t9;
		let t10_value = /*location_lat*/ ctx[5].toFixed(6) + "";
		let t10;
		let t11;
		let t12_value = /*location_lon*/ ctx[6].toFixed(6) + "";
		let t12;
		let t13;
		let t14;
		let div0;
		let t15_value = new Date(/*start*/ ctx[3]).toLocaleString("default", { hour: "numeric", minute: "numeric" }) + "";
		let t15;
		let t16;
		let t17_value = new Date(/*end*/ ctx[4]).toLocaleString("default", { hour: "numeric", minute: "numeric" }) + "";
		let t17;
		let t18;
		let div1;
		let label;
		let t20;
		let input;
		let t21;
		let button2;
		let t23;
		let if_block_anchor;
		let mounted;
		let dispose;
		let if_block = /*edit*/ ctx[0] && create_if_block(ctx);

		return {
			c() {
				h2 = element("h2");
				t0 = text(/*eventName*/ ctx[1]);
				t1 = space();
				button0 = element("button");
				button0.textContent = "Edit";
				t3 = space();
				button1 = element("button");
				button1.textContent = "Delete";
				t5 = space();
				h3 = element("h3");
				t6 = text("Owned by ");
				t7 = text(/*owner*/ ctx[2]);
				t8 = space();
				h4 = element("h4");
				t9 = text("At (");
				t10 = text(t10_value);
				t11 = text(", ");
				t12 = text(t12_value);
				t13 = text(")");
				t14 = space();
				div0 = element("div");
				t15 = text(t15_value);
				t16 = text("—");
				t17 = text(t17_value);
				t18 = space();
				div1 = element("div");
				label = element("label");
				label.textContent = "Invite user:";
				t20 = space();
				input = element("input");
				t21 = space();
				button2 = element("button");
				button2.textContent = "Send";
				t23 = space();
				if (if_block) if_block.c();
				if_block_anchor = empty();
				attr(label, "for", "invite");
				attr(input, "type", "text");
				input.required = true;
				attr(input, "id", "invite");
			},
			m(target, anchor) {
				insert(target, h2, anchor);
				append(h2, t0);
				insert(target, t1, anchor);
				insert(target, button0, anchor);
				insert(target, t3, anchor);
				insert(target, button1, anchor);
				insert(target, t5, anchor);
				insert(target, h3, anchor);
				append(h3, t6);
				append(h3, t7);
				insert(target, t8, anchor);
				insert(target, h4, anchor);
				append(h4, t9);
				append(h4, t10);
				append(h4, t11);
				append(h4, t12);
				append(h4, t13);
				insert(target, t14, anchor);
				insert(target, div0, anchor);
				append(div0, t15);
				append(div0, t16);
				append(div0, t17);
				insert(target, t18, anchor);
				insert(target, div1, anchor);
				append(div1, label);
				append(div1, t20);
				append(div1, input);
				set_input_value(input, /*username*/ ctx[9]);
				append(div1, t21);
				append(div1, button2);
				insert(target, t23, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);

				if (!mounted) {
					dispose = [
						listen(button0, "click", /*click_handler*/ ctx[15]),
						listen(button1, "click", /*deleteEvent*/ ctx[11]),
						listen(input, "input", /*input_input_handler*/ ctx[16]),
						listen(button2, "click", /*invite*/ ctx[13])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*eventName*/ 2) set_data(t0, /*eventName*/ ctx[1]);
				if (dirty & /*owner*/ 4) set_data(t7, /*owner*/ ctx[2]);
				if (dirty & /*location_lat*/ 32 && t10_value !== (t10_value = /*location_lat*/ ctx[5].toFixed(6) + "")) set_data(t10, t10_value);
				if (dirty & /*location_lon*/ 64 && t12_value !== (t12_value = /*location_lon*/ ctx[6].toFixed(6) + "")) set_data(t12, t12_value);
				if (dirty & /*start*/ 8 && t15_value !== (t15_value = new Date(/*start*/ ctx[3]).toLocaleString("default", { hour: "numeric", minute: "numeric" }) + "")) set_data(t15, t15_value);
				if (dirty & /*end*/ 16 && t17_value !== (t17_value = new Date(/*end*/ ctx[4]).toLocaleString("default", { hour: "numeric", minute: "numeric" }) + "")) set_data(t17, t17_value);

				if (dirty & /*username*/ 512 && input.value !== /*username*/ ctx[9]) {
					set_input_value(input, /*username*/ ctx[9]);
				}

				if (/*edit*/ ctx[0]) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block(ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},
			d(detaching) {
				if (detaching) {
					detach(h2);
					detach(t1);
					detach(button0);
					detach(t3);
					detach(button1);
					detach(t5);
					detach(h3);
					detach(t8);
					detach(h4);
					detach(t14);
					detach(div0);
					detach(t18);
					detach(div1);
					detach(t23);
					detach(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (102:1) {#if edit}
	function create_if_block(ctx) {
		let form;
		let div0;
		let label0;
		let t1;
		let input0;
		let t2;
		let div1;
		let label1;
		let t4;
		let input1;
		let t5;
		let div2;
		let label2;
		let t7;
		let input2;
		let t8;
		let div3;
		let label3;
		let t10;
		let input3;
		let t11;
		let div4;
		let label4;
		let t13;
		let input4;
		let t14;
		let input5;
		let mounted;
		let dispose;

		return {
			c() {
				form = element("form");
				div0 = element("div");
				label0 = element("label");
				label0.textContent = "Name:";
				t1 = space();
				input0 = element("input");
				t2 = space();
				div1 = element("div");
				label1 = element("label");
				label1.textContent = "Time:";
				t4 = space();
				input1 = element("input");
				t5 = space();
				div2 = element("div");
				label2 = element("label");
				label2.textContent = "Time:";
				t7 = space();
				input2 = element("input");
				t8 = space();
				div3 = element("div");
				label3 = element("label");
				label3.textContent = "Latitude:";
				t10 = space();
				input3 = element("input");
				t11 = space();
				div4 = element("div");
				label4 = element("label");
				label4.textContent = "Longitude:";
				t13 = space();
				input4 = element("input");
				t14 = space();
				input5 = element("input");
				attr(label0, "for", "name");
				attr(input0, "type", "text");
				attr(input0, "id", "name");
				attr(label1, "for", "start");
				attr(input1, "type", "time");
				attr(input1, "id", "start");
				attr(label2, "for", "end");
				attr(input2, "type", "time");
				attr(input2, "id", "end");
				attr(label3, "for", "lat");
				attr(input3, "type", "number");
				attr(input3, "id", "lat");
				attr(input3, "step", "any");
				attr(label4, "for", "lon");
				attr(input4, "type", "number");
				attr(input4, "id", "lon");
				attr(input4, "step", "any");
				attr(input5, "type", "submit");
				input5.value = "Create";
			},
			m(target, anchor) {
				insert(target, form, anchor);
				append(form, div0);
				append(div0, label0);
				append(div0, t1);
				append(div0, input0);
				set_input_value(input0, /*eventName*/ ctx[1]);
				append(form, t2);
				append(form, div1);
				append(div1, label1);
				append(div1, t4);
				append(div1, input1);
				set_input_value(input1, /*start_time*/ ctx[7]);
				append(form, t5);
				append(form, div2);
				append(div2, label2);
				append(div2, t7);
				append(div2, input2);
				set_input_value(input2, /*end_time*/ ctx[8]);
				append(form, t8);
				append(form, div3);
				append(div3, label3);
				append(div3, t10);
				append(div3, input3);
				set_input_value(input3, /*location_lat*/ ctx[5]);
				append(form, t11);
				append(form, div4);
				append(div4, label4);
				append(div4, t13);
				append(div4, input4);
				set_input_value(input4, /*location_lon*/ ctx[6]);
				append(form, t14);
				append(form, input5);

				if (!mounted) {
					dispose = [
						listen(input0, "input", /*input0_input_handler*/ ctx[17]),
						listen(input1, "input", /*input1_input_handler*/ ctx[18]),
						listen(input2, "input", /*input2_input_handler*/ ctx[19]),
						listen(input3, "input", /*input3_input_handler*/ ctx[20]),
						listen(input4, "input", /*input4_input_handler*/ ctx[21]),
						listen(form, "submit", prevent_default(/*submit_handler*/ ctx[22]))
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*eventName*/ 2 && input0.value !== /*eventName*/ ctx[1]) {
					set_input_value(input0, /*eventName*/ ctx[1]);
				}

				if (dirty & /*start_time*/ 128) {
					set_input_value(input1, /*start_time*/ ctx[7]);
				}

				if (dirty & /*end_time*/ 256) {
					set_input_value(input2, /*end_time*/ ctx[8]);
				}

				if (dirty & /*location_lat*/ 32 && to_number(input3.value) !== /*location_lat*/ ctx[5]) {
					set_input_value(input3, /*location_lat*/ ctx[5]);
				}

				if (dirty & /*location_lon*/ 64 && to_number(input4.value) !== /*location_lon*/ ctx[6]) {
					set_input_value(input4, /*location_lon*/ ctx[6]);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(form);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (80:17)   Loading event… {:then _}
	function create_pending_block(ctx) {
		let t;

		return {
			c() {
				t = text("Loading event…");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	function create_fragment$3(ctx) {
		let loggedinbar;
		let t;
		let await_block_anchor;
		let current;
		loggedinbar = new LoggedInBar({});

		let info = {
			ctx,
			current: null,
			token: null,
			hasCatch: false,
			pending: create_pending_block,
			then: create_then_block,
			catch: create_catch_block,
			value: 26
		};

		handle_promise(/*info_pms*/ ctx[10], info);

		return {
			c() {
				create_component(loggedinbar.$$.fragment);
				t = space();
				await_block_anchor = empty();
				info.block.c();
			},
			m(target, anchor) {
				mount_component(loggedinbar, target, anchor);
				insert(target, t, anchor);
				insert(target, await_block_anchor, anchor);
				info.block.m(target, info.anchor = anchor);
				info.mount = () => await_block_anchor.parentNode;
				info.anchor = await_block_anchor;
				current = true;
			},
			p(new_ctx, [dirty]) {
				ctx = new_ctx;
				update_await_block_branch(info, ctx, dirty);
			},
			i(local) {
				if (current) return;
				transition_in(loggedinbar.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(loggedinbar.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t);
					detach(await_block_anchor);
				}

				destroy_component(loggedinbar, detaching);
				info.block.d(detaching);
				info.token = null;
				info = null;
			}
		};
	}

	function instance$2($$self, $$props, $$invalidate) {
		let $path;
		component_subscribe($$self, path, $$value => $$invalidate(24, $path = $$value));
		let edit = false;
		let eventName;
		let owner;
		let start;
		let end;
		let location_lat;
		let location_lon;
		let day;
		let start_time;
		let end_time;
		let username;
		let { id } = $$props;
		let info_pms = reload();

		function reload() {
			return fetch(`/api/event/${id}`).then(res => res.json()).then(json => {
				$$invalidate(1, eventName = json.eventName);
				$$invalidate(2, owner = json.owner);
				$$invalidate(3, start = json.start);
				$$invalidate(4, end = json.end);
				$$invalidate(5, location_lat = json.location_lat);
				$$invalidate(6, location_lon = json.location_lon);
				day = new Date(start);
				day.setHours(0);
				day.setMinutes(0);
				$$invalidate(7, start_time = new Date(start).toLocaleString("default", { hour: "numeric", minute: "numeric" }));
				$$invalidate(8, end_time = new Date(start).toLocaleString("default", { hour: "numeric", minute: "numeric" }));
			});
		}

		async function deleteEvent() {
			if (!confirm("Are you sure you want to delete this event?")) return;
			await fetch(`/api/event/${id}`, { method: "DELETE" });
			set_store_value(path, $path = "/dashboard", $path);
		}

		async function updateEvent() {
			await fetch(`/api/event/${id}`, {
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					eventName,
					owner,
					location_lat,
					location_lon,
					start: day.getTime() + Number.parseInt(start_time.split(":")[0]) * 60 * 60 * 1000 + Number.parseInt(start_time.split(":")[1]) * 60 * 1000,
					end: day.getTime() + Number.parseInt(end_time.split(":")[0]) * 60 * 60 * 1000 + Number.parseInt(end_time.split(":")[1]) * 60 * 1000
				})
			});

			reload();
		}

		async function invite() {
			if (username === owner) return alert("Cannot invite the owner!");
			let res = await fetch(`/api/event/${id}/users/${username}`, { method: "POST" });
			let { success } = await res.json();
			if (success) alert("success");
			$$invalidate(9, username = "");
		}

		const click_handler = () => $$invalidate(0, edit = true);

		function input_input_handler() {
			username = this.value;
			$$invalidate(9, username);
		}

		function input0_input_handler() {
			eventName = this.value;
			$$invalidate(1, eventName);
		}

		function input1_input_handler() {
			start_time = this.value;
			$$invalidate(7, start_time);
		}

		function input2_input_handler() {
			end_time = this.value;
			$$invalidate(8, end_time);
		}

		function input3_input_handler() {
			location_lat = to_number(this.value);
			$$invalidate(5, location_lat);
		}

		function input4_input_handler() {
			location_lon = to_number(this.value);
			$$invalidate(6, location_lon);
		}

		const submit_handler = () => updateEvent();

		$$self.$$set = $$props => {
			if ('id' in $$props) $$invalidate(14, id = $$props.id);
		};

		return [
			edit,
			eventName,
			owner,
			start,
			end,
			location_lat,
			location_lon,
			start_time,
			end_time,
			username,
			info_pms,
			deleteEvent,
			updateEvent,
			invite,
			id,
			click_handler,
			input_input_handler,
			input0_input_handler,
			input1_input_handler,
			input2_input_handler,
			input3_input_handler,
			input4_input_handler,
			submit_handler
		];
	}

	class Event extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$2, create_fragment$3, safe_not_equal, { id: 14 });
		}
	}

	/* src/Router.svelte generated by Svelte v4.2.0 */

	function create_fragment$2(ctx) {
		let switch_instance;
		let switch_instance_anchor;
		let current;
		const switch_instance_spread_levels = [/*props*/ ctx[1]];
		var switch_value = /*currentComponent*/ ctx[0];

		function switch_props(ctx, dirty) {
			let switch_instance_props = {};

			if (dirty !== undefined && dirty & /*props*/ 2) {
				switch_instance_props = get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[1])]);
			} else {
				for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
					switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
				}
			}

			return { props: switch_instance_props };
		}

		if (switch_value) {
			switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
		}

		return {
			c() {
				if (switch_instance) create_component(switch_instance.$$.fragment);
				switch_instance_anchor = empty();
			},
			m(target, anchor) {
				if (switch_instance) mount_component(switch_instance, target, anchor);
				insert(target, switch_instance_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				if (dirty & /*currentComponent*/ 1 && switch_value !== (switch_value = /*currentComponent*/ ctx[0])) {
					if (switch_instance) {
						group_outros();
						const old_component = switch_instance;

						transition_out(old_component.$$.fragment, 1, 0, () => {
							destroy_component(old_component, 1);
						});

						check_outros();
					}

					if (switch_value) {
						switch_instance = construct_svelte_component(switch_value, switch_props(ctx, dirty));
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
					} else {
						switch_instance = null;
					}
				} else if (switch_value) {
					const switch_instance_changes = (dirty & /*props*/ 2)
					? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[1])])
					: {};

					switch_instance.$set(switch_instance_changes);
				}
			},
			i(local) {
				if (current) return;
				if (switch_instance) transition_in(switch_instance.$$.fragment, local);
				current = true;
			},
			o(local) {
				if (switch_instance) transition_out(switch_instance.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(switch_instance_anchor);
				}

				if (switch_instance) destroy_component(switch_instance, detaching);
			}
		};
	}

	const PREFIX = "";

	function isOptions(component) {
		return Object.hasOwn(component, "component");
	}

	function instance$1($$self, $$props, $$invalidate) {
		const routes = {
			"/signup": Signup,
			"/login": Login,
			"/dashboard": Dashboard,
			"/settings": Settings,
			"/event/(?<id>\\d+)(?<edit>(/edit)?)": {
				component: Event,
				transform: ({ id, edit }) => ({ id: Number.parseInt(id), edit: !!edit })
			}
		};

		const compiled = Object.entries(routes).map(([route, component]) => [
			new RegExp("^" + PREFIX + route + "$"),
			isOptions(component) ? component : { component }
		]);

		let { defaultComponent } = $$props;
		let currentComponent = defaultComponent;
		let props = {};

		path.subscribe(path => {
			history.pushState({}, "", path);
			updateRoute(path);
		});

		window.onpopstate = () => {
			// updateRoute(window.location.pathname);
			path.set(window.location.pathname);
		};

		function updateRoute(path) {
			var _a;

			for (const [route, options] of compiled) {
				let match = path.match(route);

				if (match) {
					$$invalidate(1, props = ((_a = options.transform) !== null && _a !== void 0
					? _a
					: x => x)(match.groups));

					$$invalidate(0, currentComponent = options.component);
					return;
				}
			}

			$$invalidate(1, props = {});
			$$invalidate(0, currentComponent = defaultComponent);
		}

		updateRoute(window.location.pathname);

		$$self.$$set = $$props => {
			if ('defaultComponent' in $$props) $$invalidate(2, defaultComponent = $$props.defaultComponent);
		};

		return [currentComponent, props, defaultComponent];
	}

	class Router extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$1, create_fragment$2, safe_not_equal, { defaultComponent: 2 });
		}
	}

	/* src/pages/Home.svelte generated by Svelte v4.2.0 */

	function create_fragment$1(ctx) {
		let button0;
		let t1;
		let button1;
		let mounted;
		let dispose;

		return {
			c() {
				button0 = element("button");
				button0.textContent = "Login";
				t1 = space();
				button1 = element("button");
				button1.textContent = "Signup";
			},
			m(target, anchor) {
				insert(target, button0, anchor);
				insert(target, t1, anchor);
				insert(target, button1, anchor);

				if (!mounted) {
					dispose = [
						listen(button0, "click", /*click_handler*/ ctx[1]),
						listen(button1, "click", /*click_handler_1*/ ctx[2])
					];

					mounted = true;
				}
			},
			p: noop,
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(button0);
					detach(t1);
					detach(button1);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	function instance($$self, $$props, $$invalidate) {
		let $path;
		component_subscribe($$self, path, $$value => $$invalidate(0, $path = $$value));

		if (getUsernameCookie()) {
			set_store_value(path, $path = "/dashboard", $path);
		}

		const click_handler = () => set_store_value(path, $path = "/login", $path);
		const click_handler_1 = () => set_store_value(path, $path = "/signup", $path);
		return [$path, click_handler, click_handler_1];
	}

	class Home extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance, create_fragment$1, safe_not_equal, {});
		}
	}

	/* src/App.svelte generated by Svelte v4.2.0 */

	function create_fragment(ctx) {
		let router;
		let current;
		router = new Router({ props: { defaultComponent: Home } });

		return {
			c() {
				create_component(router.$$.fragment);
			},
			m(target, anchor) {
				mount_component(router, target, anchor);
				current = true;
			},
			p: noop,
			i(local) {
				if (current) return;
				transition_in(router.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(router.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(router, detaching);
			}
		};
	}

	class App extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, null, create_fragment, safe_not_equal, {});
		}
	}

	var index = new App({ target: document.body });

	return index;

})();
