import React, { useState } from 'react';
import { Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/react-hooks';

import { Permission } from '@leaa/common/src/entrys';
import { CreatePermissionInput } from '@leaa/common/src/dtos/permission';
import { IPage } from '@leaa/dashboard/src/interfaces';
// eslint-disable-next-line max-len
import { CREATE_PERMISSION } from '@leaa/common/src/graphqls';
import { CREATE_BUTTON_ICON } from '@leaa/dashboard/src/constants';
import { messageUtil } from '@leaa/dashboard/src/utils';

import { PageCard, ErrorCard, SubmitBar } from '@leaa/dashboard/src/components';

import { PermissionInfoForm } from '../_components/PermissionInfoForm/PermissionInfoForm';

import style from './style.module.less';

export default (props: IPage) => {
  const { t } = useTranslation();

  // ref
  const [permissionInfoFormRef, setPermissionInfoFormRef] = useState<any>();

  // mutation
  const [submitVariables, setSubmitVariables] = useState<{ permission: CreatePermissionInput }>();
  const [createPermissionMutate, createPermissionMutation] = useMutation<{ createPermission: Permission }>(
    CREATE_PERMISSION,
    {
      variables: submitVariables,
      onError: e => message.error(messageUtil.formatGqlmessage(e.message)),
      onCompleted({ createPermission }) {
        message.success(t('_lang:createdSuccessfully'));
        props.history.push(`/permissions/${createPermission.id}`);
      },
    },
  );

  const onSubmit = async () => {
    let hasError = false;
    let submitData: CreatePermissionInput = {} as CreatePermissionInput;

    permissionInfoFormRef.props.form.validateFieldsAndScroll(async (err: any, formData: CreatePermissionInput) => {
      if (err) {
        hasError = true;
        message.error(err[Object.keys(err)[0]].errors[0].message);

        return;
      }

      submitData = {
        ...submitData,
        ...formData,
      };
    });

    if (hasError) {
      return;
    }

    await setSubmitVariables({
      ...submitVariables,
      ...{ permission: submitData },
    });
    await createPermissionMutate();
  };

  return (
    <PageCard
      title={t(`${props.route.namei18n}`)}
      className={style['wapper']}
      loading={createPermissionMutation.loading}
    >
      {createPermissionMutation.error ? <ErrorCard error={createPermissionMutation.error} /> : null}

      <PermissionInfoForm wrappedComponentRef={(inst: unknown) => setPermissionInfoFormRef(inst)} />

      <SubmitBar>
        <Button
          type="primary"
          size="large"
          icon={CREATE_BUTTON_ICON}
          className="submit-button"
          loading={createPermissionMutation.loading}
          onClick={onSubmit}
        >
          {t('_lang:create')}
        </Button>
      </SubmitBar>
    </PageCard>
  );
};
