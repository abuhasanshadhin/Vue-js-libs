<script setup>
import { menu } from '../config/menu';
import { useAccordion } from '../composables/accordion';
import { onMounted, ref } from 'vue';

const sidebarRef = ref(null);
const accordionIndex = ref(null);

onMounted(() => {
    useAccordion(sidebarRef, {
        current: ({ index }) => {
            accordionIndex.value = index;
        },
    });
});
</script>

<template>
    <main class="m-3">
        <div class="container">
            <ul ref="sidebarRef"
                class="sidebar">
                <li v-for="(item, ind) in menu"
                    :key="ind">
                    <template v-if="item.children && item.children.length">
                        <div class="d-flex justify-space-between">
                            <a href="javascript:void(0)"
                                :data-accordion-target="`target-${ind}`"
                                v-text="item.name" class="me-2"></a>
                            <span v-if="accordionIndex === ind"
                                class="fw-bold text-primary">^</span>
                            <span v-else
                                class="fw-bold text-primary"
                                style="transform:rotate(180deg)">^</span>
                        </div>
                        <ul :data-accordion-item="`target-${ind}`">
                            <li v-for="(child, i) in item.children"
                                :key="i">
                                <a href=""
                                    v-text="child.name"></a>
                            </li>
                        </ul>
                    </template>
                    <template v-else>
                        <a href=""
                            v-text="item.name"></a>
                    </template>
                </li>
            </ul>
        </div>
    </main>
</template>