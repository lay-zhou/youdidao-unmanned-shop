import { Service } from 'egg';
import { ForbiddenError } from 'apollo-server';

export default class BannerService extends Service {
    // 获取列表
    async fetch(position) {
        const { ctx } = this;
        const { Banner } = ctx.model;
        const { service } = ctx;
        const options = {
            where: {
                position,
            },
            raw: true,
        }
        const result = await Banner.findAll(options);
        const newList: any = [];
        for (const iterator of result) {
            if (iterator.imageKey) {
                iterator.imageUrl = await service.file.generatePrivateDownloadUrl(iterator.imageKey);
                await newList.push(iterator);
              } else {
                iterator.imageUrl = null;
                await newList.push(iterator);
              }
        }
        return newList;
    };

    // 添加
    async add(input) {
        const { ctx } = this;
        const { Banner, File } = ctx.model;
        const { title, position, fileKey } = input;
        if (fileKey) {
            const image = await File.findByPk(fileKey);
            if (!image) await File.create({ key: fileKey });
        }
        return await Banner.create({ title, position, imageKey: fileKey });
    };

    // 更新
    async update(input) {
        const { ctx } = this;
        const { File, Banner } = ctx.model;
        const { id, title, position, fileKey } = input;
        const item = await Banner.findByPk(id);
        if (!item) throw new ForbiddenError('该图片不存在！');
        const image = await File.findByPk(fileKey);
        if (!image) await File.create({ key: fileKey });
        const data: any = {};
        if (title) data.title = title;
        if (position) data.position = position;
        if (fileKey) data.imageKey = fileKey;
        return await item.update(data);
    };

    // 删除
    async delete(id) {
        const { ctx } = this;
        const { Banner } = ctx.model;
        const item = await Banner.findByPk(id);
        if (!item) throw new ForbiddenError('该图片不存在！');
        await item.destroy();
        return true;
    }
}
