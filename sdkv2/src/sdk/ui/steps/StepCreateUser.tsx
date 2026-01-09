import { Form, Input, Button, Select, DatePicker, Switch, message } from "antd";
import dayjs from "dayjs";
import { useChatStore } from "../../store/chat.store";
import { getSocket, createUser } from "../../socket/socket";
import { getSDKConfig } from "../../config";
import { informConfigError } from "../../common";

export function StepCreateUser() {
	const onFinish = (values: any) => {
		createUser(values);
	};

  return (
    <Form 
			layout="vertical" 
			onFinish={onFinish}
			initialValues={{
				dob: dayjs().subtract(18, "year"),
			}}
		>
      <Form.Item name="name" label="Name" initialValue="Annonymous" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="email" label="Email" initialValue="annonymous@email.com" rules={[{ required: true, type: "email" }]}>
        <Input />
      </Form.Item>

      <Form.Item name="dob" label="DOB" rules={[{ required: true }]}>
        <DatePicker className="w-full" />
      </Form.Item>

      <Form.Item name="gender" initialValue="Male">
        <Select options={[
          {value:'Male'}, {value:'Female'}, {value:'Other'}
        ]}/>
      </Form.Item>

			<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
				<Form.Item
					name="agree"
					valuePropName="checked"
					rules={[
						{
							validator: (_, value) =>
								value
									? Promise.resolve()
									: Promise.reject(alert("You must agree to terms")),
						},
					]}
					style={{ marginBottom: 0 }}
				>
					<Switch />
				</Form.Item>
				<span>I agree to terms</span>
			</div>

      <Button htmlType="submit" type="primary" block>
        Continue
      </Button>
    </Form>
  );
}