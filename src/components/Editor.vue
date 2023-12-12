<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
    modelValue: undefined,
    textContent: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const editor = ref(null);

const setContents = () => {
    const innerContent = props.textContent ? 'innerText' : 'innerHTML';
    const contents = editor.value[innerContent];
    emit('update:modelValue', contents);
}

onMounted(() => {
    editor.value.addEventListener('input', () => {
        setContents();
    });
});

const toBold = () => {
    const selection = window.getSelection().getRangeAt(0);
    const selectedText = selection.extractContents();
    const span = document.createElement('b');
    span.appendChild(selectedText);
    selection.insertNode(span);

    setContents();
};

const toItalic = () => {

};
</script>

<template>
    <div class="card">
        <div class="card-header">
            <div class="d-flex gap-2">
                <button type="button"
                    @click="toBold"
                    class="btn btn-secondary btn-sm">Bold</button>
                <button type="button"
                    @click="toItalic"
                    class="btn btn-secondary btn-sm">Italic</button>
            </div>
        </div>
        <div ref="editor"
            class="card-body"
            contenteditable="true">
        </div>
    </div>
</template>