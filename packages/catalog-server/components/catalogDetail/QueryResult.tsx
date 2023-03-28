import { Typography, Button, Badge, Dropdown, Space, Menu } from 'antd';
import {
  DownOutlined,
  FilterOutlined,
} from '@vulcan-sql/catalog-server/lib/icons';
import styled from 'styled-components';
import { useMemo, useState } from 'react';
import CustomizedTable from './CustomizedTable';
import ParameterForm from './ParameterForm';
import GoogleSpreadsheetModal from './GoogleSpreadsheetModal';
import {
  Parameter,
  Column,
  Dataset,
} from '@vulcan-sql/catalog-server/lib/__generated__/types';
import Link from 'next/link';

const { Title } = Typography;

const StyledQueryResult = styled.div`
  .queryResult {
    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 40px;
      margin-bottom: 24px;
      padding-bottom: 8px;
      border-bottom: 1px var(--gray-4) solid;

      .ant-typography {
        margin: 0;
      }
    }
    &-btnGroup {
      position: relative;
      display: flex;
      flex-wrap: nowrap;
      > * + * {
        margin-left: 16px;
      }
    }
    &-btnTrigger {
      position: relative;

      .ant-btn {
        .anticon {
          margin-right: 4px;
        }
      }
    }
    &-parameterForm {
      position: absolute;
      right: 0;
      z-index: 10;
      margin-top: 8px;
    }
    &-table {
      margin-bottom: 36px;
    }
  }

  .ant-badge {
    display: block;
  }
  .ant-badge-count {
    background-color: var(--geekblue-6);
  }

  .ant-dropdown-menu-item-group-title {
    font-weight: 700;
    font-size: 12px;
    color: var(--gray-8);
  }
  .ant-dropdown-menu-item-group-list {
    margin: 0;
  }
`;

/* eslint-disable-next-line */
export interface QueryResultProps {
  columns: Column[];
  parameters: Parameter[];
  dataset: Dataset;
  loading: boolean;
  onDatasetPreview: (options?: any) => void;
}

export default function QueryResult(props: QueryResultProps) {
  const { dataset, parameters, columns, loading, onDatasetPreview } = props;
  const [parameterFormVisible, setParameterFormVisible] = useState(false);
  const [parameterCount, setParameterCount] = useState(0);
  const hasDataset = Object.keys(dataset).length > 0;
  const hasCount = parameterCount > 0;
  const {
    data = [],
    apiUrl = '',
    csvDownloadUrl = '',
    jsonDownloadUrl = '',
    metadata,
  } = dataset;
  const [googleSpreadsheetVisible, setGoogleSpreadsheetVisible] =
    useState(false);

  const tableColumns = useMemo(
    () =>
      Object.keys(data[0] || {}).map((name) => {
        const column = columns.find((col) => col.name === name);
        return {
          title: column?.name || name,
          dataIndex: name,
          key: name,
        };
      }),
    [data, columns]
  );

  const resultData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        key: `${JSON.stringify(item)}${index}`,
      })),
    [data]
  );

  const onParameterFormReset = () => {
    setParameterCount(0);
    setParameterFormVisible(false);
    onDatasetPreview();
  };

  const onParameterFormSubmit = (values) => {
    const count = Object.values(values).reduce(
      (acc: number, cur) => (cur ? acc + 1 : acc),
      0
    ) as number;
    onDatasetPreview(values);
    setParameterCount(count);
    setParameterFormVisible(false);
  };

  const menu = (
    <Menu
      style={{ width: 160 }}
      items={[
        {
          label: 'Copy API URL',
          key: 'copy-api-url',
          onClick: () => {
            navigator.clipboard.writeText(apiUrl);
          },
        },
        {
          label: (
            <Link href={csvDownloadUrl}>
              <a target="_blank">Download as CSV</a>
            </Link>
          ),
          key: 'download-as-csv',
        },
        {
          label: (
            <Link href={jsonDownloadUrl}>
              <a target="_blank">Download as JSON</a>
            </Link>
          ),
          key: 'download-as-json',
        },
        { type: 'divider' },
        {
          label: 'Connect From',
          type: 'group',
          key: 'connect-from',
        },
        {
          label: 'Excel',
          key: 'excel',
        },
        {
          label: 'Google Spreadsheet',
          key: 'google-spreadsheet',
          onClick: () => {
            setGoogleSpreadsheetVisible(true);
          },
        },
        {
          label: 'Zapier',
          key: 'zapier',
        },
        {
          label: 'Retool',
          key: 'retool',
        },
      ]}
    />
  );

  return (
    <StyledQueryResult>
      <div className="queryResult-header">
        <Title level={4}>Results</Title>
        <div className="queryResult-btnGroup">
          <div className="queryResult-btnTrigger">
            <Button
              icon={<FilterOutlined />}
              type={hasCount ? 'primary' : 'default'}
              ghost={hasCount}
              onClick={() => setParameterFormVisible(!parameterFormVisible)}
            >
              <Space align="center">
                Select Parameters
                <Badge count={parameterCount} />
              </Space>
            </Button>
            {/* trigger form */}
            <ParameterForm
              className="queryResult-parameterForm"
              visible={parameterFormVisible}
              loading={loading}
              parameters={parameters}
              onReset={onParameterFormReset}
              onSubmit={onParameterFormSubmit}
            />
          </div>
          <div>
            {/* May meet problem with `overlay` prop after 4.24.0, it changes to `menu` prop */}
            <Dropdown
              disabled={!hasDataset}
              overlay={menu}
              placement="topRight"
              getPopupContainer={(trigger) => trigger.parentElement!}
            >
              <Button type="primary">
                <Space align="center">
                  Connects
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>

      <CustomizedTable
        className="queryResult-table"
        showHeader={hasDataset}
        columns={tableColumns}
        dataSource={resultData}
        loading={loading}
        scroll={{ y: 283 }}
        renderUnit={() =>
          metadata
            ? `${metadata.currentCount} of ${metadata.totalCount} Results`
            : ''
        }
      />

      <GoogleSpreadsheetModal
        open={googleSpreadsheetVisible}
        codeContent="https://api.canner.co/v0/pipes/untitled_pipe_8974.json?token=p.eyJ1IjogIjgyM2Q3ZDNjLWNjNWItNGY2YS04N2E5LWI0YzAxZDA3YTllZCIsICJpZCI6ICI2NmM1MmU2Ni02ZTQwLTQ4N2UtOGEwNC1iZGMzMGJiMDJhMzYifQ.HB-M8Lo09eeGnridyuuRD82okTI9BboWlFGsARJcDt4"
        onCancel={() => setGoogleSpreadsheetVisible(false)}
        onOk={() => setGoogleSpreadsheetVisible(false)}
        destroyOnClose={true}
      />
    </StyledQueryResult>
  );
}
