import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

export default function Footer() {
  return (
    <AntFooter
      style={{
        textAlign: 'center',
        background: '#001529',
        color: '#8896a8',
        padding: '32px 24px',
      }}
    >
      <div style={{ marginBottom: 8, color: '#fff', fontSize: 16, fontWeight: 600 }}>
        纬达派 Vatapex
      </div>
      <div style={{ fontSize: 13 }}>链接全球红人，合规撬动销量</div>
      <div style={{ fontSize: 12, marginTop: 16, color: '#5a6a7c' }}>
        © {new Date().getFullYear()} Vatapex · 红人推广 + VAT 合规一站式服务
      </div>
    </AntFooter>
  );
}