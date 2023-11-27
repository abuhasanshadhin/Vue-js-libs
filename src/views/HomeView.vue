<script setup>
import { reactive, ref } from 'vue';
import Validator from '../plugins/validator';
import DataTable from '../components/DataTable.vue';
import { faker } from '@faker-js/faker';
import Pagination from '../components/Pagination.vue';

const headers = [
    { name: 'First Name', value: 'first_name' },
    { name: 'Last Name', value: 'last_name' },
    { name: 'Gender', value: 'gender' },
    { name: 'Age', value: item => item },
];

const users = ref([]);
const _users = [];

// for (let i = 0; i < 1000; i++) {
//     _users.push({
//         first_name: faker.person.firstName(),
//         last_name: faker.person.lastName(),
//         gender: faker.person.sex(),
//         age: faker.number.int(75),
//     });
// }

users.value = _users;

const data = reactive({
    name: '',
    email: '',
    mobile: '',
    extra: {
        age: '',
    }
});

const validator = new Validator(data, {
    name: 'required|between:3,5',
    email: 'required|email',
    'extra.age': 'nullable|between:3,5',
});

const submit = (ev) => {
    if (validator.execute().passes()) {
        console.log('submitted');
    } else {
        console.log('validation failed');
    }
}
</script>

<template>
    <main class="m-3">
        <div class="container">
            <Pagination />

            <DataTable :headers="headers"
                :items="users"></DataTable>

            <div class="row justify-content-center">
                <div class="col-md-5">
                    <div class="card">
                        <div class="card-header">Form</div>
                        <div class="card-body">
                            <form @submit.prevent="submit"
                                method="post"
                                autocomplete="off">
                                <div class="mb-3">
                                    <label for="name"
                                        class="form-label">Name</label>
                                    <input type="text"
                                        v-model="data.name"
                                        id="name"
                                        class="form-control">
                                    <div class="text-danger">{{ validator.firstError('name') }}</div>
                                </div>
                                <div class="mb-3">
                                    <label for="email"
                                        class="form-label">E-Mail</label>
                                    <input type="text"
                                        v-model="data.email"
                                        id="email"
                                        class="form-control">
                                    <div class="text-danger">{{ validator.firstError('email') }}</div>
                                </div>
                                <div class="mb-3">
                                    <label for="mobile"
                                        class="form-label">Mobile</label>
                                    <input type="text"
                                        v-model="data.mobile"
                                        id="mobile"
                                        class="form-control">
                                    <div class="text-danger">{{ validator.firstError('mobile') }}</div>
                                </div>
                                <div class="mb-3">
                                    <label for="age"
                                    class="form-label">Age</label>
                                <input type="text"
                                    v-model.number="data.extra.age"
                                    id="age"
                                    class="form-control">
                                <div class="text-danger">{{ validator.firstError('extra.age') }}</div>
                            </div>
                            <div class="mb-2">
                                <input type="submit"
                                    value="Submit"
                                    class="btn btn-primary">
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main></template>