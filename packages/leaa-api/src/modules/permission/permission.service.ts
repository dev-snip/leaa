import { Injectable } from '@nestjs/common';
import { Repository, In, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Permission } from '@leaa/common/src/entrys';
import {
  PermissionsWithPaginationObject,
  CreatePermissionInput,
  UpdatePermissionInput,
} from '@leaa/common/src/dtos/permission';
import { argsUtil, curdUtil, paginationUtil, msgUtil } from '@leaa/api/src/utils';
import { IPermissionsArgs, IPermissionArgs, IGqlCtx } from '@leaa/api/src/interfaces';
import { ConfigService } from '@leaa/api/src/modules/config/config.service';
import { permissionsSeed } from '@leaa/api/src/modules/seed/seed.data';

const CLS_NAME = 'PermissionService';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
    private readonly configService: ConfigService,
  ) {}

  async PLEASE_DONT_MODIFY_DEMO_DATA(id?: number, gqlCtx?: IGqlCtx): Promise<boolean> {
    if (this.configService.DEMO_MODE && !process.argv.includes('--nuke')) {
      if (!id) return true;

      const p = await this.permission(id);

      if (p && p.slug && permissionsSeed.map((seed) => seed.slug).includes(p.slug as any)) {
        throw msgUtil.error({ t: ['_error:pleaseDontModify'], gqlCtx });
      }
    }

    return true;
  }

  async permissions(args: IPermissionsArgs): Promise<PermissionsWithPaginationObject> {
    const nextArgs: IPermissionsArgs = argsUtil.format(args);

    const qb = this.permissionRepository.createQueryBuilder();
    qb.select().orderBy(nextArgs.orderBy || 'created_at', nextArgs.orderSort);

    // q
    if (nextArgs.q) {
      const aliasName = new SelectQueryBuilder(qb).alias;

      ['name', 'slug'].forEach((key) => {
        qb.orWhere(`${aliasName}.${key} LIKE :${key}`, { [key]: `%${nextArgs.q}%` });
      });
    }

    const pageInfo = await paginationUtil.calcQbPageInfo({
      qb,
      page: nextArgs.page,
      pageSize: nextArgs.pageSize,
    });

    return {
      ...pageInfo,
      items: pageInfo.items.map((i) => ({
        ...i,
        slugGroup: i.slug.split('.')[0],
      })),
    };
  }

  async permission(id: number, args?: IPermissionArgs): Promise<Permission | undefined> {
    let nextArgs: IPermissionArgs = {};
    if (args) nextArgs = args;

    return this.permissionRepository.findOne(id, nextArgs);
  }

  async permissionSlugsToIds(slugs: string[]): Promise<number[]> {
    let permissionIds: number[] = [];

    const permissions = await this.permissionRepository.find({
      slug: In(slugs),
    });

    if (permissions && permissions.length > 0) {
      permissionIds = permissions.map((p) => p.id);
    }

    return permissionIds;
  }

  async createPermission(args: CreatePermissionInput): Promise<Permission | undefined> {
    return this.permissionRepository.save({ ...args });
  }

  async updatePermission(id: number, args: UpdatePermissionInput, gqlCtx?: IGqlCtx): Promise<Permission | undefined> {
    if (this.configService.DEMO_MODE) await this.PLEASE_DONT_MODIFY_DEMO_DATA(id, gqlCtx);

    if (curdUtil.isOneField(args, 'status')) {
      return curdUtil.commonUpdate({ repository: this.permissionRepository, CLS_NAME, id, args });
    }

    return curdUtil.commonUpdate({ repository: this.permissionRepository, CLS_NAME, id, args });
  }

  async deletePermission(id: number, gqlCtx?: IGqlCtx): Promise<Permission | undefined> {
    if (this.configService.DEMO_MODE) await this.PLEASE_DONT_MODIFY_DEMO_DATA(id, gqlCtx);

    return curdUtil.commonDelete({ repository: this.permissionRepository, CLS_NAME, id });
  }
}
