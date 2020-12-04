//
// What ist the purpose of this module?
//
// The ReactJS development server will get overloaded
// and start to reset connections if it has too many pending
// proxy requests at the same time.
// "Too many" like "3 or 4" ...
//
// While a production setup should be much more forgiving
// in this matter, it is certainly a nice idea to do
// requests to the backend sequentially to avoid
// thundering herd problems and similar stuff. Doing so will
// give you a low and homogenous workload on the server. The
// price is a relatively slow update rate.
//
// This module solves this problem in allowing
// "Updatable"s (e.g. mounted ReactJS components), which
// have a async updater() method to register.
// Until they unregister, they will be updated one at
// a time with a grace period (e.g. 100ms) between.


export interface Updatable {
    update(): Promise<void>;
}


export class Updater {
    grave_period_milliseconds: number;
    items: Updatable[] = [];
    current_index: number = 0;
    is_running: boolean = false;
    timer?: any = undefined;

    constructor(grave_period_milliseconds: number) {
        this.grave_period_milliseconds = grave_period_milliseconds
    }

    register(newItem: Updatable): void {
        this.items.push(newItem);
    }

    unregister(oldItem: Updatable): void {
        let index = this.items.indexOf(oldItem);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }

    start(): void {
        this.is_running = true;
        this.schedule_next_update();
    }

    stop(): void {
        this.is_running = false;
        clearTimeout(this.timer);
    }

    schedule_next_update(): void {
        if (this.is_running) {
            setTimeout(
                () => { this.do_one_update() },
                this.grave_period_milliseconds
            );
        }
    }

    async do_one_update() {
        let n = this.items.length;
        let index = this.current_index;

        if (index < n) {
            let item = this.items[index];
            await item.update();
        }

        this.select_next_index();
        this.schedule_next_update();
    }

    select_next_index() {
        let n = this.items.length;
        let index = this.current_index;

        index += 1;
        if (index >= n) {
            index = 0;
        }
        this.current_index = index;
    }
}

export default Updater;
