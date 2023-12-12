<script setup>
const props = defineProps({
    items: { type: Array, default: [] },
    modelValue: { type: Number, default: 1 },
    btnPrevHandler: { type: Function, default: () => true },
    btnNextHandler: { type: Function, default: () => true },
});

const emit = defineEmits([
    'update:modelValue',
    'btn:previous',
    'btn:submit',
    'btn:next',
]);

const goToPrevious = (ev) => {
    if (props.modelValue > 1) {
        if (props.btnPrevHandler()) {
            const prev = props.modelValue - 1;
            emit('update:modelValue', prev);
            emit('btn:previous', ev);
        }
    }
};

const goToNext = (ev) => {
    if (props.modelValue < props.items.length) {
        if (props.btnNextHandler()) {
            const next = props.modelValue + 1;
            emit('update:modelValue', next);
            emit('btn:next', ev);
        }
    }
};
</script>

<template>
    <div class="card">
        <div class="card-header py-3">
            <div class="row justify-content-center">
                <div class="col-md-10">
                    <div class="stepper-header">
                        <template v-for="(item, i) in items">
                            <div class="line">
                                <div :class="{ active: i < modelValue }"
                                    class="line-inner"></div>
                            </div>
                            <div :class="{ active: i < modelValue }"
                                class="title">
                                <span class="count">{{ i + 1 }}</span>
                                {{ item.label }}
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-body">
            <slot :name="`item:${modelValue}`"></slot>
        </div>
        <div class="card-footer">
            <div class="clearfix">
                <div class="float-start">
                    <button type="button"
                        v-if="modelValue > 1"
                        @click="goToPrevious"
                        class="btn btn-outline-dark btn-sm">Previous</button>
                </div>
                <div class="float-end">
                    <button v-if="items.length === modelValue"
                        type="button"
                        @click="emit('btn:submit', $event)"
                        class="btn btn-outline-dark btn-sm">Submit</button>
                    <button v-else
                        type="button"
                        @click="goToNext"
                        class="btn btn-outline-dark btn-sm">Next</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.stepper-header {
    display: flex;
    justify-content: space-between;

    .title {
        text-wrap: nowrap;

        .count {
            display: inline-block;
            background: rgba(0, 0, 0, 0.471);
            color: white;
            padding: 0 8px;
            border-radius: 50%;
            font-size: 15px;
            transition: all .5s;
        }

        &.active {
            font-weight: bold;

            .count {
                background: black;
            }
        }
    }

    .line {
        height: 5px;
        background: rgba(0, 0, 0, 0.471);
        width: 100%;
        margin-top: 10px;
        margin-right: 5px;
        margin-left: 5px;

        .line-inner {
            background: transparent;
            height: 100%;
            width: 0;
            transition: all .5s;

            &.active {
                background: black;
                width: 100%;
            }
        }

        &:first-child {
            display: none;
        }
    }
}
</style>