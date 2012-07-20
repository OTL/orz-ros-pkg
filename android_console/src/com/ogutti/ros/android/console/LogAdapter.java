package com.ogutti.ros.android.console;

import java.util.List;

import com.ogutti.ros.android.console.LogUtil;

import android.util.Log;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;


public class LogAdapter extends ArrayAdapter<rosgraph_msgs.Log> {
  private LayoutInflater layoutInflater_;

  public LogAdapter(Context context,
                    int textViewResourceId,
                    List<rosgraph_msgs.Log> objects) {
    super(context, textViewResourceId, objects);
    layoutInflater_ = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
  }

  @Override
  public View getView(int position, View convertView, ViewGroup parent) {
    // 特定の行(position)のデータを得る
    Log.d("RosArrayAdapter", "getView");
    rosgraph_msgs.Log item = (rosgraph_msgs.Log)getItem(position);

    Log.d("RosArrayAdapter", "getItem");

    // convertViewは使い回しされている可能性があるのでnullの時だけ新しく作る
    if (null == convertView) {
      convertView = layoutInflater_.inflate(R.layout.list, null);
    }
    Log.d("RosArrayAdapter", "convertView null end");
    TextView typeTextView = (TextView)convertView.findViewById(R.id.console_type_text);
    typeTextView.setText("");
    TextView messageTextView = (TextView)convertView.findViewById(R.id.console_message_text);
    messageTextView.setText(item.getMsg());
    messageTextView.setTextColor(LogUtil.levelToColor(item.getLevel()));
    Log.d("RosArrayAdapter", "getView end");
    return convertView;
  }

}
