<template>
  <ul>
    <li>📝簡易メモ帳</li>
    <li><button @click="$emit('newButtonClicked')">新規作成</button></li>
    <li>
      <select v-model="selectedMemoId">
        <option v-for="memo in memos.list" :key="memo.id" :value="memo.id">
          {{ memo.title }}
        </option>
      </select>
      <button @click="$emit('openButtonClicked', selectedMemoId)">
        を開く
      </button>
    </li>
    <li v-if="user.value != null">
      <img
        :src="user.value.photoURL"
        style="width: 24px; float: left; margin-right: 1em"
      />
      {{ user.value.email }}
      <button @click="$emit('logoutButtonClicked')">ログアウト</button>
    </li>
    <li v-else>
      {{ user.value }}
      <button @click="$emit('loginButtonClicked')">ログイン</button>
    </li>
  </ul>
</template>

<script lang="ts">
import { Memo } from "./EditMemo.vue";
import { PropType } from "vue";
import firebase from "firebase";

export default {
  name: "Navigation",
  props: {
    memos: Object as PropType<{ list: [Memo] }>,
    user: Object as PropType<{ value: firebase.User }>,
  },
  emits: [
    "newButtonClicked",
    "openButtonClicked",
    "loginButtonClicked",
    "logoutButtonClicked",
  ],
  data() {
    // 初期値は-1とし、何も選択されていない状態とする
    return {
      selectedMemoId: -1,
    };
  },
};
</script>

<style scoped>
ul {
  width: 100%;
  list-style-type: none;
  border-bottom: lightgray 1px solid;
  padding: 1em;
  display: flex;
  justify-content: space-evenly;
  width: 100%;
}
</style>
