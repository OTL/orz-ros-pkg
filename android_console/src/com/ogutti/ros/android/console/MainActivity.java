package com.ogutti.ros.android.console;

import java.util.List;
import java.util.ArrayList;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;

import org.ros.address.InetAddressFactory;
import org.ros.android.RosActivity;

import org.ros.node.NodeConfiguration;
import org.ros.node.NodeMainExecutor;

import com.ogutti.ros.android.console.LogUtil;
import com.ogutti.ros.android.console.RosListView;


/**
 * @author t.ogura@gmain.com (Takashi Ogura)
 */
public class MainActivity extends RosActivity {

  private RosListView<rosgraph_msgs.Log> listView;
  private LogAdapter adapter;
  private LogPublisher talker;

  public MainActivity() {
    super("rxconsole", "rxconsole");
  }


  @SuppressWarnings("unchecked")
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.main);
    List<rosgraph_msgs.Log> data = new ArrayList<rosgraph_msgs.Log>();

    final AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(this);

    adapter = new LogAdapter(this, R.layout.list, data);

    listView = (RosListView<rosgraph_msgs.Log>)findViewById(R.id.listView);
    listView.setTopicName("rosout_agg");
    listView.setMessageType(rosgraph_msgs.Log._TYPE);
    listView.setAdapter(adapter);
    listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
        @Override
        public void onItemClick(AdapterView<?> parent, View view,
                int position, long id) {
            ListView listView = (ListView) parent;
            // クリックされたアイテムを取得します
            rosgraph_msgs.Log log = (rosgraph_msgs.Log) listView.getItemAtPosition(position);
            alertDialogBuilder
                .setTitle("Node: " + log.getName())
                .setMessage("Location: " + log.getFile() + ":in `"  + log.getFunction() + "':" + log.getLine() + "\n"
                            + "Severity: " + LogUtil.levelToString(log.getLevel()) + "\n\n"
                            + log.getMsg())
                .setPositiveButton("OK", null)
                .show();
        }
    });
  }

  @Override
  protected void init(NodeMainExecutor nodeMainExecutor) {
    NodeConfiguration nodeConfiguration =
        NodeConfiguration.newPublic(
            InetAddressFactory.newNonLoopback().getHostAddress(),
            getMasterUri());
    talker = new LogPublisher();

    nodeMainExecutor.execute(talker,
                             nodeConfiguration.setNodeName("talker"));
    nodeMainExecutor.execute(listView,
                             nodeConfiguration.setNodeName("android_console"));
  }
}
