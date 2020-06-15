import { Service } from 'egg';
import _ = require('lodash');

export default class ItemClassifyService extends Service {
    // 获取列表
    async fetch() {
        const { model, service } = this.ctx;
        const { Project } = model;
        const result = await Project.findAll({ raw: true });
        const newList: any = [];
        const resultList = result;
        for (const iterator of resultList) {
            if (iterator.imageKey) {
                iterator.imageUrl = await service.file.generatePrivateDownloadUrl(iterator.imageKey);
                await newList.push(iterator);
            } else {
                iterator.imageUrl = null;
                await newList.push(iterator);
            }
        };
        return newList;
    };

    // 获取单个
    async fetchById(id) {
        const { model, service } = this.ctx;
        const { Project } = model;
        const item = await Project.findByPk(id);
        if (item.imageKey) await service.file.generatePrivateDownloadUrl(item.imageKey);
        return item;
    }

    // 添加
    async add(input) {
        const { model } = this.ctx;
        const { Project } = model;
        return await Project.create(input);
    };

    // 更新
    async update(input) {
        const { model, service } = this.ctx;
        const { Project } = model;
        const item = await Project.findByPk(input.id);
        await item.update(_.pickBy(_.pick(input, ['imageKey', 'title']),
            value => value !== null,
        ));
        if (item.imageKey) await service.file.generatePrivateDownloadUrl(item.imageKey);
        return item;
    };

    // 删除
    async remove(id) {
        const { model } = this.ctx;
        const { Project } = model;
        const item = await Project.findByPk(id);
        await item.destroy();
        return true;
    }
}
