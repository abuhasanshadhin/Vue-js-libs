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
    <aside>
        <ul ref="sidebarRef"
            class="sidebar">
            <li v-for="(item, ind) in menu"
                :key="ind">
                <template v-if="item.children && item.children.length">
                    <a href="javascript:void(0)"
                        :data-accordion-target="`target-${ind}`"
                        class="d-block me-2">
                        <div class="clearfix">
                            <div v-text="item.name"
                                class="float-start"></div>
                            <div class="float-end">
                                <div v-if="accordionIndex === ind"
                                    class="fw-bold text-white"
                                    :style="{ transform: 'rotate(180deg)' }">^</div>
                                <div v-else
                                    class="fw-bold text-white">^</div>
                            </div>
                        </div>
                    </a>
                    <ul :data-accordion-item="`target-${ind}`">
                        <li v-for="(child, i) in item.children"
                            :key="i">
                            <a href=""
                                class="d-block"
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
    </aside>
</template>