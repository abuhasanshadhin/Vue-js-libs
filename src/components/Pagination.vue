<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    total: { type: Number, default: 100 },
});

const current = ref(1);
const pages = ref([]);

const showLeftDots = ref(false);
const showRightDots = ref(false);

const goTo = (page) => {
    if (current.value === page) return;
    current.value = page;
}

const goToPrev = () => {
    if (current.value > 1) {
        current.value -= 1;
    }
}

const goToNext = () => {
    if (current.value < props.total) {
        current.value += 1;
    }
}

watch(
    current,
    (page) => {
        let min = 0;
        let max = 0;
        let leftDots = false;
        let rightDots = false;

        if (props.total <= 5) {
            min = 2;
            max = 4;
        } else {
            if (page <= 4) {
                min = 2;
                max = 5;
                rightDots = true;
            } else if (page > 4 && page < (props.total - 3)) {
                min = current.value - 1;
                max = current.value + 1;
                leftDots = true;
                rightDots = true;
            } else {
                min = props.total - 4;
                max = props.total - 1;
                leftDots = true;
                rightDots = false;
            }
        }

        const numbers = [];
        
        for (let i = min; i <= max; i++) {
            numbers.push(i);
        }

        pages.value = numbers;
        showLeftDots.value = leftDots;
        showRightDots.value = rightDots;
    },
    { immediate: true }
);
</script>

<template>
    <nav aria-label="Page navigation example">
        <ul class="pagination">
            <li :class="{ disabled: current === 1 }"
                class="page-item">
                <button type="button"
                    @click="goToPrev"
                    class="page-link">Previous</button>
            </li>

            <li :class="{ active: current === 1 }"
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
                :class="{ 'active': page == current }"
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

            <li :class="{ active: current === total }"
                class="page-item">
                <button type="button"
                    @click="goTo(total)"
                    class="page-link">{{ total }}</button>
            </li>

            <li :class="{ disabled: current === total }"
                class="page-item">
                <button type="button"
                    @click="goToNext"
                    class="page-link">Next</button>
            </li>
        </ul>
    </nav>
</template>