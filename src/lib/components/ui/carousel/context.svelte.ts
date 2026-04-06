import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import EmblaCarousel from "embla-carousel";
import { createContext, untrack } from "svelte";

export class EmblaCarouselContext {
    ref = $state<HTMLElement>()!;
    api = $state<EmblaCarouselType>()!;
    options = $state<EmblaOptionsType>();

    prevButtonDisabled = $state(false);
    nextButtonDisabled = $state(false);

    constructor() {
        $effect(() => {
            if (!this.ref) {
                return;
            }

            this.api = EmblaCarousel(this.ref, this.options);

            untrack(() => {
                this.api.on("init", () => {
                    this.api.on(
                        "reInit",
                        this.toggleButtonsDisabled.bind(this),
                    );
                    this.api.on(
                        "select",
                        this.toggleButtonsDisabled.bind(this),
                    );
                });

                this.toggleButtonsDisabled();
            });
        });
    }

    toggleButtonsDisabled() {
        this.prevButtonDisabled = !this.api.canScrollPrev();
        this.nextButtonDisabled = !this.api.canScrollNext();
    }

    init(options?: EmblaOptionsType) {
        this.options = options;

        return (element: HTMLElement) => {
            this.ref = element;

            return () => {
                this.api.destroy();
            };
        };
    }
}

const [get, set] = createContext<EmblaCarouselContext>();
export const createEmblaCarousel = () => set(new EmblaCarouselContext());
export const useEmblaCarousel = get;
