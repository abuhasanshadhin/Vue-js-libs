<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    modelValue: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
});

const emit = defineEmits(['update:modelValue', 'page']);

const pages = ref([]);
const showLeftDots = ref(false);
const showRightDots = ref(false);

const createPageItems = () => {
    let min = 0;
    let max = 0;
    let isLeftDots = false;
    let isRightDots = false;

    const tempPages = [];

    if (props.totalPages > 5) {
        if (props.modelValue <= 4) {
            min = 2;
            max = 5;
            isRightDots = true;
        } else if (props.modelValue > 4 && props.modelValue < (props.totalPages - 3)) {
            min = props.modelValue - 1;
            max = props.modelValue + 1;
            isLeftDots = true;
            isRightDots = true;
        } else {
            min = props.totalPages - 4;
            max = props.totalPages - 1;
            isLeftDots = true;
            isRightDots = false;
        }
    } else {
        min = 1;
        max = props.totalPages;
    }

    for (let i = min; i <= max; i++) {
        tempPages.push(i);
    }

    pages.value = tempPages;
    showLeftDots.value = isLeftDots;
    showRightDots.value = isRightDots;
}

watch(() => props.modelValue, createPageItems, { immediate: true });
watch(() => props.totalPages, createPageItems, { immediate: true });

const goTo = (page) => {
    if (props.modelValue === page) return;
    emit('update:modelValue', page);
    emit('page', page);
}

const goToPrev = () => {
    if (props.modelValue > 1) {
        goTo(props.modelValue - 1);
    }
}

const goToNext = () => {
    if (props.modelValue < props.totalPages) {
        goTo(props.modelValue + 1);
    }
}
</script>

<template>
    <nav v-if="totalPages"
        aria-label="Page navigation example">
        <ul class="pagination pagination-sm">
            <li :class="{ disabled: modelValue === 1 }"
                class="page-item">
                <button type="button"
                    @click="goToPrev"
                    class="page-link">Previous</button>
            </li>
            <li v-if="totalPages > 5"
                :class="{ active: modelValue === 1 }"
                class="page-item">
                <button type="button"
                    @click="goTo(1)"
                    class="page-link">1</button>
            </li>
            <li v-if="showLeftDots"
                class="page-item disabled">
                <button type="button"
                    class="page-link">...</button>
            </li>
            <li v-for="page in pages"
                :class="{ 'active': page == modelValue }"
                class="page-item">
                <button type="button"
                    @click="goTo(page)"
                    class="page-link">{{ page }}</button>
            </li>
            <li v-if="showRightDots"
                class="page-item disabled">
                <button type="button"
                    class="page-link">...</button>
            </li>
            <li v-if="totalPages > 5"
                :class="{ active: modelValue === totalPages }"
                class="page-item">
                <button type="button"
                    @click="goTo(totalPages)"
                    class="page-link">{{ totalPages }}</button>
            </li>
            <li :class="{ disabled: modelValue === totalPages }"
                class="page-item">
                <button type="button"
                    @click="goToNext"
                    class="page-link">Next</button>
            </li>
        </ul>
    </nav>
</template>

<style scoped lang="scss">
.pagination {
    .page-item {
        &.disabled {
            user-select: none;
        }
    }
}
</style>