<template>
  <navigation
    :memos="memos"
    :user="user"
    @newButtonClicked="newMemo"
    @openButtonClicked="openMemo"
    @loginButtonClicked="login"
    @logoutButtonClicked="logout"
  />
  <edit-memo
    :memo="currentMemo"
    @saveButtonClicked="saveMemo"
    @deleteButtonClicked="deleteMemo"
  />
</template>

<script lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
import EditMemo, { Memo } from "./components/EditMemo.vue";
import Navigation from "./components/Navigation.vue";
import { reactive, getCurrentInstance, ref, onMounted } from "vue";

import firebase from "firebase/app";
import "firebase/firestore";

export default {
  name: "App",
  components: {
    // HelloWorld
    EditMemo,
    Navigation,
  },
  setup(props, Context) {
    // globalPropertiesへのアクセス
    const internalInstance = getCurrentInstance();
    const globalProperties =
      internalInstance.appContext.config.globalProperties;
    const auth = globalProperties.auth as firebase.auth.Auth;

    let currentMemo = reactive(({
      id: -1,
      title: "",
      content: "",
    } as unknown) as Memo);

    // memos array型からオブジェクト型に変換
    let memos = reactive({
      list: ([] as unknown) as [Memo],
    });

    let maxMemoId = ref(0);

    let user = reactive({
      value: auth.currentUser,
    });

    let userDataPath = ref(
      user.value ? `user/${user.value.uid}` : "data/memoData"
    );

    console.log(userDataPath.value);

    const loadUserData = () => {
      let db = globalProperties.db as firebase.firestore.Firestore;
      db.collection(`${userDataPath.value}/memos`)
        .get()
        .then((querySnapshot) => {
          memos.list = reactive(([] as unknown) as [Memo]);
          querySnapshot.forEach((doc) => {
            memos.list.push(doc.data() as Memo);
          });
          console.log(memos.list);
          db.doc(userDataPath.value)
            .get()
            .then((doc) => {
              maxMemoId.value = doc.data().maxMemoId;
            });
        });
    };

    const logout = () => {
      console.log("logout");
      globalProperties.auth.signOut().then(() => {
        // thenメソッドはひとつ前の処理を非同期処理し、
        // その結果正しく処理された場合の処理を第1引数に記述する
        user.value = null;
      });
    };

    const login = () => {
      console.log("login");
      const provider = new firebase.auth.GoogleAuthProvider();
      globalProperties.auth
        .signInWithPopup(provider)
        .then((result) => {
          // ログインに成功した場合
          console.log("認証に成功しました。", result);
          console.log(result.user);
          user.value = reactive(result.user);
          console.log(user.value.uid);
          userDataPath.value = `user/${user.value.uid}`;
          console.log(user);
          loadUserData();
          newMemo();
        })
        .catch((error) => {
          alert("エラーが発生しました。" + error.message);
        });
    };
    const deleteMemo = (): void => {
      console.log(currentMemo);
      // currentMemo.id = -1の時、保存されていないので、何もしない。
      if (currentMemo.id == -1) return;
      // 現在のメモを削除し、新規メモを作成する
      let deleteIndex = -1;
      for (let i = 0; i < memos.list.length; i++) {
        if (currentMemo.id == memos.list[i].id) {
          deleteIndex = i; // 削除対象のindexを格納
          break;
        }
      }
      if (deleteIndex != -1) {
        // 削除対象が存在する場合
        if (
          confirm(
            `本当にメモ[${memos.list[deleteIndex].title}]を削除しますか？`
          )
        ) {
          memos.list.splice(deleteIndex, 1); // 対象の配列要素を１個削除
          let db = globalProperties.db as firebase.firestore.Firestore;
          db.collection(`${userDataPath.value}/memos`)
            .where("id", "==", currentMemo.id)
            .get()
            .then((querySnapshot) => {
              if (!querySnapshot.empty) {
                querySnapshot.docs[0].ref.delete().then(() => {
                  newMemo(); // 新規メモを作成
                });
              }
            });
          newMemo(); // 新規作成
        }
      }
    };

    const openMemo = (selectedMemoId: number): void => {
      // 合致するメモを探し、currentMemoに代入する
      console.log("openMemo");

      memos.list.forEach((memo) => {
        if (memo.id == selectedMemoId) {
          currentMemo.id = memo.id;
          currentMemo.title = memo.title;
          currentMemo.content = memo.content;

          console.log(currentMemo);
        }
      });
    };
    const saveMemo = () => {
      let db = globalProperties.db as firebase.firestore.Firestore;
      let saveMemo2Cloud = (memo) => {
        let memosRef = db.collection(`${userDataPath.value}/memos`);
        memosRef
          .where("id", "==", memo.id)
          .get()
          .then((querySnapshot) => {
            if (querySnapshot.empty) {
              memosRef.add(memo); // 対象のメモが存在しない時追加
            } else {
              querySnapshot.docs[0].ref.set(memo); //対象のメモが存在する時上書き
            }
          });
      };
      if (currentMemo.id == -1) {
        // 新規メモ
        db.doc(userDataPath.value)
          .get()
          .then((doc) => {
            let maxMemoId =
              doc.data() == null || doc.data().maxMemoId == null
                ? 0
                : doc.data().maxMemoId + 1;
            console.log(maxMemoId);
            if (maxMemoId == 0) {
              // 初めてのアクセスの場合、setメソッドでドキュメントを作成
              doc.ref.set({ maxMemoId: 0 }).then(() => {
                currentMemo.id = maxMemoId;
                memos.list.push(Object.assign({}, currentMemo));
                console.log("初めてのアクセスの場合");
                saveMemo2Cloud(currentMemo);
              });
            } else {
              // 2回目移行はmaxMemoIdを更新
              doc.ref.update("maxMemoId", maxMemoId).then(() => {
                currentMemo.id = maxMemoId;
                memos.list.push(Object.assign({}, currentMemo));
                console.log("2回目移行");
                console.log(memos);
                saveMemo2Cloud(currentMemo);
              });
            }
          });
      } else saveMemo2Cloud(currentMemo); //上書き保存
    };

    const newMemo = () => {
      currentMemo.id = -1;
      currentMemo.title = "";
      currentMemo.content = "";
    };
    onMounted(() => {
      console.log("mounted!");
      loadUserData();
    });
    return {
      memos,
      currentMemo,
      user,
      newMemo,
      openMemo,
      login,
      logout,
      saveMemo,
      deleteMemo,
    };
  },
  methods: {
  },
};
</script>