<p align="center">
<img src="./build/icons/icon.png" width="120">
</p>

# 值日任务表

> Duty Schedule 一款解放劳动委员的双手的 APP

[![](https://img.shields.io/github/release/qwqcode/duty-schedule.svg?style=flat-square)](https://github.com/qwqcode/duty-schedule/releases/latest)
[![](https://img.shields.io/github/last-commit/qwqcode/duty-schedule/master.svg?style=flat-square)](https://github.com/qwqcode/duty-schedule/commits/master)
[![](https://img.shields.io/github/issues-raw/qwqcode/duty-schedule.svg?style=flat-square)](https://github.com/qwqcode/duty-schedule/issues)
[![](https://img.shields.io/github/issues-pr-raw/qwqcode/duty-schedule.svg?style=flat-square)](https://github.com/qwqcode/duty-schedule/pulls)
[![](https://img.shields.io/github/license/qwqcode/duty-schedule.svg?style=flat-square)](./LICENSE)
[![](https://img.shields.io/badge/%24-donate-%23ff69b4.svg?style=flat-square)](#捐助)

## 特性

- 灵活轻便
- 自动任务安排算法
- 自动选组算法
- 手动快速任务下达
- 大屏轮播公示
- 个人历史值日计数
- 小组成员展示
- 任务类型展示
- 扁平化友好 UI
- 密码保护*
- JSON 灵活数据处理
- 云端数据同步
- [独立核心库](https://github.com/qwqcode/duty-schedule-core)

## 预览

![1](https://user-images.githubusercontent.com/22412567/68088210-b0b9e380-fe97-11e9-92f8-70a89e3dd16c.png)
![2](https://user-images.githubusercontent.com/22412567/68088211-b1527a00-fe97-11e9-9717-7a039e33a692.png)
![3](https://user-images.githubusercontent.com/22412567/68088212-b1eb1080-fe97-11e9-9d68-d43e58f344a3.png)
![4](https://user-images.githubusercontent.com/22412567/68088213-b1eb1080-fe97-11e9-9941-ba4e243de73c.png)
![5](https://user-images.githubusercontent.com/22412567/68088214-b283a700-fe97-11e9-9cb1-beced8aa46b5.png)
![6](https://user-images.githubusercontent.com/22412567/68088215-b31c3d80-fe97-11e9-836f-d4ccdb7c7f6e.png)
![7](https://user-images.githubusercontent.com/22412567/68088216-b31c3d80-fe97-11e9-9ba3-2d2f7daaa600.png)
![8](https://user-images.githubusercontent.com/22412567/68088218-b3b4d400-fe97-11e9-81eb-9823d59c6fa6.png)
![9](https://user-images.githubusercontent.com/22412567/68088220-b44d6a80-fe97-11e9-8cbd-c562f4ec588a.png)
![10](https://user-images.githubusercontent.com/22412567/68088221-b44d6a80-fe97-11e9-9c52-8895e58bd08c.png)
![11](https://user-images.githubusercontent.com/22412567/68088222-b44d6a80-fe97-11e9-82f1-d1ab24459325.png)
![12](https://user-images.githubusercontent.com/22412567/68088223-b4e60100-fe97-11e9-989d-916ec4c6fca0.png)
![13](https://user-images.githubusercontent.com/22412567/68088224-b57e9780-fe97-11e9-8d15-eade4978e407.png)

## 开发

#### Dev Setup

核心库

```bash
# clone core lib
git clone https://github.com/qwqcode/duty-schedule-core

yarn link
```

客户端

```
# clone the project
git clone https://github.com/qwqcode/duty-schedule -b dev

# install dependencies
yarn install
yarn link duty-schedule-core

# start developing
yarn dev

# lint all JS/Vue component files in `src/`
yarn run lint
```

#### Build Setup

``` bash
# clone the project
git clone https://github.com/qwqcode/duty-schedule

# install dependencies
yarn install

# build electron application for production
yarn run build
```

## 捐助

如果您觉得我的项目对您有帮助，并且您愿意给予我一点小小的支持，您可以通过以下方式向我捐助，这样可以维持项目持续地发展，非常感谢！(/ω＼)

| Alipay | Wechat | 
| :------: | :------: | 
| <img width="150" src="https://raw.githubusercontent.com/qwqcode/donate-qwqaq/master/docs/donate/alipay.png"> | <img width="150" src="https://raw.githubusercontent.com/qwqcode/donate-qwqaq/master/docs/donate/wechat.png"> | 

捐助者的名字将保存于 [捐助者名单](https://github.com/qwqcode/donate-qwqaq)

最后，我再次对您致以诚挚的感谢！

## License
[GPL-2.0](./LICENSE)
