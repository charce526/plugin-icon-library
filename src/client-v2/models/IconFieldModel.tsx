import React from 'react';
import { IconFieldModel as CoreIconFieldModel } from '@nocobase/client-v2';

export function createIconFieldModel(Picker: React.ComponentType<any>): typeof CoreIconFieldModel {
  return class IconFieldModel extends CoreIconFieldModel {
    render() { return <Picker {...this.props} />; }
  };
}
