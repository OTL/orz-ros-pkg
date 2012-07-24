package com.ogutti.ros.android.console;

import java.util.List;
import java.util.ArrayList;

import android.app.AlertDialog;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.content.DialogInterface.OnMultiChoiceClickListener;
import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;

import org.ros.address.InetAddressFactory;
import org.ros.android.RosActivity;

import org.ros.node.NodeConfiguration;
import org.ros.node.NodeMainExecutor;

import rosgraph_msgs.Log;

import com.ogutti.ros.android.console.LogUtil;
import com.ogutti.ros.android.console.RosListView;


/**
 * rxconsole (android version) main Activity
 *
 * @author t.ogura@gmain.com (Takashi Ogura)
 */
public class MainActivity extends RosActivity {

  /*  private LogPublisher talker; */

  /** view of log messages */
  private RosListView<rosgraph_msgs.Log> listView;
  /** adapter for convert log message to ListView  */
  private LogAdapter adapter;
  /** use notification for more than Error message */
  private NotificationManager notificationManager;
  /** filter of message */
  private LevelLogFilter filter;
  /** state of pause/play. */
  private boolean isPaused;

  /**
   * initialize activity and filter
   */
  public MainActivity() {
    super("rxconsole", "rxconsole");
    this.filter = new LevelLogFilter();
    isPaused = false;

  }

  /**
   * create ListView (ROS node)
   * @param savedInstanceState
   */
  @SuppressWarnings("unchecked")
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.main);

    notificationManager =
        (NotificationManager)getSystemService(Context.NOTIFICATION_SERVICE);

    List<rosgraph_msgs.Log> data = new ArrayList<rosgraph_msgs.Log>();

    final AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(this);

    adapter = new LogAdapter(this, R.layout.list, data);
    adapter.setFilter(filter);
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
              .setMessage(
                  "Time: " + log.getHeader().getStamp().toString() + "\n" +
                  "Severity: " + LogUtil.levelToString(log.getLevel()) + "\n" +
                  "Location: " + log.getFile() + ":in `"  + log.getFunction() +
                  "':" + log.getLine() + "\n" +
                  "Published Topics: " + log.getTopics().toString() + "\n\n" +
                  log.getMsg())
              .setPositiveButton("OK", null)
              .show();
        }
      });
  }

  /**
   * Creation of Menu (Clear/SetLevel/Pause)
   *
   * @param menu
   * @return
   */
  @Override
  public boolean onCreateOptionsMenu(Menu menu) {
    boolean ret = super.onCreateOptionsMenu(menu);

    menu.add(0, Menu.FIRST, Menu.NONE, "Clear")
        .setIcon(android.R.drawable.ic_menu_close_clear_cancel);
    menu.add(0, Menu.FIRST + 1, Menu.NONE , "Set Level")
        .setIcon(android.R.drawable.ic_menu_preferences);
    menu.add(0, Menu.FIRST + 2, Menu.NONE, "Pause")
        .setIcon(android.R.drawable.ic_media_pause);
    return ret;
  }

  /**
   * Callback of log item selection.
   * Shows alert dialog.
   *
   * @param item clicked item
   * @return
   */
  @Override
  public boolean onOptionsItemSelected(MenuItem item) {
    super.onOptionsItemSelected(item);
    switch(item.getItemId()){
      case Menu.FIRST:
        adapter.clear();
        return true;
      case Menu.FIRST + 1:
        final AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(this);
        final boolean[] bools = this.filter.getBooleanArray();
        alertDialogBuilder.setMultiChoiceItems(LogUtil.getLevelStrings(),
                                               bools,
                                               new OnMultiChoiceClickListener() {
                                                 @Override
                                                 public void onClick(DialogInterface dialog, int which,
                                                                     boolean isChecked) {
                                                   bools[which] = isChecked;
                                                 }
                                               });
        // Set boolean values to filter
        alertDialogBuilder.setPositiveButton("OK",
                                             new OnClickListener() {
                                               @Override
                                               public void onClick(DialogInterface dialog, int which) {
                                                 filter.setBooleanArray(bools);
                                               }
                                             });
        // cancel settings
        alertDialogBuilder.setNegativeButton("Cancel",
                                             new OnClickListener() {
                                               @Override
                                               public void onClick(DialogInterface dialog, int which) {
                                               }
                                             });

        alertDialogBuilder
            .setTitle("Select Levels")
            .create()
            .show();

        return true;
      case Menu.FIRST + 2:
        if (this.isPaused) {
          // resume
          adapter.setFilter(filter);
          isPaused = false;
        } else {
          adapter.setFilter(new LogFilter() {
              @Override
              public boolean UseLog(Log log) {
                return false;
              }
            });
          isPaused = true;
        }
        return true;
    }
    return false;
  }

  /**
   * notification callback. this is called by a click.
   *
   * @param log clicked message
   */
  public void sendNotification(rosgraph_msgs.Log log) {
    String messageForShow = "ROS " + LogUtil.levelToString(log.getLevel());
    Notification n = new Notification(android.R.drawable.ic_dialog_alert,
                                      messageForShow + " Happend",
                                      System.currentTimeMillis());
    PendingIntent pending = PendingIntent.getActivity(
        this,
        0,
        new Intent(),
        PendingIntent.FLAG_CANCEL_CURRENT);

    n.setLatestEventInfo(getApplicationContext(),
                         messageForShow,
                         log.getName() + ": " + log.getMsg(),
                         pending);
    n.flags = Notification.FLAG_AUTO_CANCEL;
    notificationManager.notify(R.string.app_name, n);
  }

  /**
   * clear all notifications
   */
  public void clearNotification() {
    notificationManager.cancelAll();
  }

  /**
   * initialize ROS instances. listView contains subscriber of /rosout_agg
   *
   * @param nodeMainExecutor ROS node
   */
  @Override
  protected void init(NodeMainExecutor nodeMainExecutor) {
    NodeConfiguration nodeConfiguration =
        NodeConfiguration.newPublic(
            InetAddressFactory.newNonLoopback().getHostAddress(),
            getMasterUri());
    /*
      talker = new LogPublisher();

      nodeMainExecutor.execute(talker,
      nodeConfiguration.setNodeName("talker"));
    */
    nodeMainExecutor.execute(listView,
                             nodeConfiguration.setNodeName("android_console"));
  }
}
