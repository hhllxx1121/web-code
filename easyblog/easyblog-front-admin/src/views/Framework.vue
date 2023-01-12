<template>
  <div class="layout">
    <el-container>
      <el-header class="header">
        <div class="logo">HHLLXX</div>
        <div class="user-info">
          <span>欢迎回来，</span>
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              <span class="nick-name">
                {{ userInfo.nickName }}
                <span class="iconfont icon-arrow-down"></span>
              </span>
            </span>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <router-link to="/settings/me" class="a-link"
                    >个人信息</router-link
                  >
                </el-dropdown-item>
                <el-dropdown-item @click="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div class="avatar"><img :src="userInfo.avatar" /></div>
        </div>
      </el-header>
      <el-container class="container">
        <el-aside width="200px" class="left-aside">
          <div>
            <el-button class="post-btn" @click="createHtml">发布</el-button>
          </div>
          <div class="menu-panel">
            <ul>
              <li v-for="(menu, index) in menuList" :key="index">
                <span class="menu-title-p" @click="openClose(index)">
                  <span :class="['iconfont', menu.icon]"></span>
                  <span class="menu-title">{{ menu.title }}</span>
                  <span
                    :class="[
                      'iconfont',
                      menu.open ? 'icon-arrow-up' : 'icon-arrow-down',
                      'open-close',
                    ]"
                  ></span>
                </span>
                <ul class="sub-menu" v-show="menu.open">
                  <li
                    v-for="(subMenu, subIndex) in menu.children"
                    :key="subIndex"
                  >
                    <router-link
                      :to="subMenu.path"
                      :class="[
                        'sub-menu-item',
                        activatePath == subMenu.path ? 'activate' : '',
                      ]"
                      v-if="subMenu.roleType==null||subMenu.roleType==userInfo.roleType"
                      >{{ subMenu.title }}</router-link
                    >
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </el-aside>
        <el-main class="right-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <Dialog
      :show="progressDialog.show"
      :title="progressDialog.title"
      :buttons="progressDialog.buttons"
      @close="progressDialog.show = false"
      :show-close="false"
      :showCancle="false"
    >
      <div class="progress-container">
        <div class="progress-panel">
          <el-progress
            type="circle"
            :percentage="progressInfo.progress"
            :status="progressInfo.status"
            :color="colors"
          />
        </div>
        <div class="error" v-if="progressInfo.result == 0">
          <div>生成页面出错了，{{ progressInfo.errMsg }}</div>
          <div class="info">具体错误，请查看服务器日志</div>
        </div>
        <div
          class="success"
          v-if="progressInfo.progress == 100 && progressInfo.result == 1"
        >
          发布成功
        </div>
        <div
          class="btn-panel"
          v-if="progressInfo.progress == 100 || progressInfo.result == 0"
        >
          <el-button
            class="btn"
            type="primary"
            @click="progressDialog.show = false"
            >关闭</el-button
          >
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, reactive, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import store from "../store";

const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();

const api = {
  getUserInfo: "getUserInfo",
  logout: "logout",
  createHtml: "createHtml",
  checkProgress: "checkProgress",
};
const menuList = ref([
  {
    title: "博客",
    icon: "icon-blog",
    open: "true",
    children: [
      {
        title: "博客管理",
        path: "/blog/list",
      },
      {
        title: "分类管理",
        path: "/blog/category",
      },
    ],
  },
  {
    title: "专题",
    icon: "icon-zhuanti",
    open: "true",
    children: [
      {
        title: "专题管理",
        path: "/special/list",
      },
    ],
  },
  {
    title: "设置",
    icon: "icon-setting",
    open: "true",
    children: [
      {
        title: "个人信息设置",
        path: "/settings/me",
      },
      {
        title: "博客成员",
        path: "/settings/teamUser",
      },
      {
        title: "系统设置",
        path: "/settings/sysInfo",
        roleType:1
      },
    ],
  },
  {
    title: "回收站",
    icon: "icon-delete",
    open: "true",
    children: [
      {
        title: "回收站",
        path: "/recovery/list",
      },
    ],
  },
]);

const openClose = (index) => {
  const open = menuList.value[index].open;
  menuList.value[index].open = !open;
};

const userInfo = ref({});

const init = async () => {
  let result = await proxy.Request({
    url: api.getUserInfo,
  });
  if (!result) {
    return;
  }

  userInfo.value = result.data;
  userInfo.value.avatar = proxy.globalInfo.imageUrl + result.data.avatar;
};
init();
const activatePath = ref(null);
watch(
  route,
  (newValue, oldValue) => {
    activatePath.value = newValue.path;
  },
  { immediate: true, deep: true }
);

const logout = () => {
  proxy.Confirm(`你确定要退出吗？`, async () => {
    let result = await proxy.Request({
      url: api.logout,
    });
    if (!result) {
      return;
    }
    router.push("/login");
  });
};

watch(
  () => store.state.userInfo,
  (newVal, oldVal) => {
    const avatar = proxy.globalInfo.imageUrl + newVal.avatar;
    const nickName = newVal.nickName;
    userInfo.value = { avatar, nickName };
  },
  { immediate: true, deep: true }
);

// 发布
const colors = [
  { color: "#f56c6c", percentage: 20 },
  { color: "#e6a23c", percentage: 40 },
  { color: "#6f7ad3", percentage: 60 },
  { color: "#1989fa", percentage: 80 },
  { color: "#5cb87a", percentage: 100 },
];

const progressDialog = reactive({
  title: "发布",
  buttons: [],
  show: false,
});

const progressInfo = reactive({
  progress: 0,
});
let checkTimer = null;
const createHtml = async () => {
  progressDialog.show = true;
  progressInfo.progress = 0;
  progressInfo.status = undefined;
  let result = await proxy.Request({
    url: api.createHtml,
  });
  if (!result) {
    return;
  }
  checkProgress();
  checkTimer = setInterval(() => {
    checkProgress();
  }, 1000);
};
const checkProgress = async () => {
  let result = await proxy.Request({
    url: api.checkProgress,
    showLoading: false,
  });

  if (!result) {
    return;
  }
  if (result.data.result == 0) {
    progressInfo.status == "exception";
    progressInfo.errorMsg = result.data.errMsg;
  
  } else {
    progressInfo.progress = result.data.progress;
  }
  progressInfo.result = result.data.progress;
  if (
    (result.data.progress == 100 || result.data.result == 0) &&
    checkTimer != null
  ) {
    clearInterval(checkTimer);
  }
};
</script>

<style lang="scss">
.layout {
  .header {
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .logo {
      font-size: 30px;
      color: rgb(6, 152, 219);
    }
    .user-info {
      display: flex;
      align-items: center;
      .nick-name {
        cursor: pointer;
        color: rgb(243, 5, 136);
      }
      .avatar {
        margin-left: 10px;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 25px;
        background: #ddd;
        img {
          border-radius: 25px;
          width: 50px;
        }
      }
    }
  }
  .container {
    padding-top: 10px;
    background: #f5f6f7;
    height: calc(100vh - 60px);

    .left-aside {
      padding: 0 15px;
      width: 280px;
      .post-btn {
        background: green;
        color: #fff;
        height: 40px;
        width: 100%;
        margin-bottom: 15px;
      }
      .menu-panel {
        ul,
        li {
          padding: 0;
          margin: 0;
          list-style: none;
        }
        .menu-title-p {
          padding: 0 5px;
          line-height: 45px;
          cursor: pointer;
          display: block;
          display: flex;
          .iconfont {
            font-size: 20px;
            color: #91949a;
          }
          .menu-title {
            flex: 1;
            color: #3f4042;
            margin-left: 10px;
          }

          .open-close {
            width: 20px;
            font-size: 18px;
          }
        }

        .menu-title-p:hover {
          background: #ddd;
          border-radius: 3px;
        }

        .sub-menu {
          font-size: 14px;

          .sub-menu-item {
            padding: 0 10px 0 33px;
            display: block;
            cursor: pointer;
            line-height: 40px;
            text-decoration: none;
            color: #3f4042;
          }
          .activate {
            background: #ddd;
          }
          .sub-menu-item:hover {
            background: #ddd;
            border-radius: 3px;
          }
        }
      }
    }
    .right-main {
      position: relative;
      background: #fff;
      padding: 20px 10px 10px 10px;
    }
  }
}
.progress-container {
  .progress-panel {
    display: flex;
    justify-content: center;
  }
  .error {
    color: red;
    margin-top: 20px;
    .info {
      font-size: 13px;
    }
  }
  .success {
    margin-top: 20px;
    text-align: center;
    font-size: 16px;
    color: green;
  }
  .btn-panel {
    text-align: center;
    margin-top: 20px;

    .btn {
      margin: 0 auto;
    }
  }
}
</style>