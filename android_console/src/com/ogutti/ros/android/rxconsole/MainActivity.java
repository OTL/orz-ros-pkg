package com.ogutti.ros.android.rxconsole;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;

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
import android.widget.Toast;
import org.ros.address.InetAddressFactory;
import org.ros.android.RosActivity;
import org.ros.exception.RosRuntimeException;

import org.ros.node.NodeConfiguration;
import org.ros.node.NodeMainExecutor;

import rosgraph_msgs.Log;

import com.google.common.collect.Lists;
import com.ogutti.ros.android.rxconsole.LogUtil;
import com.ogutti.ros.android.rxconsole.RosListView;


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

  private String hostName = null;

  private static final int CLEAR_MENU_ID = Menu.FIRST;
  private static final int SETTING_MENU_ID = Menu.FIRST + 1;
  private static final int PAUSE_MENU_ID = Menu.FIRST + 2;
  private static final int RESUME_MENU_ID = Menu.FIRST + 3;
  private static final int SELECT_IP_MENU_ID = Menu.FIRST + 4;
private static final int MASTER_CHOOSER_REQUEST_CODE = 0;

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

    menu.add(0, CLEAR_MENU_ID, Menu.NONE, "Clear")
        .setIcon(android.R.drawable.ic_menu_close_clear_cancel);
    menu.add(0, SETTING_MENU_ID, Menu.NONE , "Set Level")
        .setIcon(android.R.drawable.ic_menu_preferences);
    menu.add(0, PAUSE_MENU_ID, Menu.NONE, "Pause")
        .setIcon(android.R.drawable.ic_media_pause);
    menu.add(0, RESUME_MENU_ID, Menu.NONE, "Resume")
        .setIcon(android.R.drawable.ic_media_play);
    menu.add(0, SELECT_IP_MENU_ID, Menu.NONE, "Select IP")
        .setIcon(android.R.drawable.ic_menu_manage);
    return ret;
  }

  @Override
  public boolean onPrepareOptionsMenu(Menu menu) {
    menu.findItem(PAUSE_MENU_ID).setVisible(!isPaused);
    menu.findItem(RESUME_MENU_ID).setVisible(isPaused);

    return super.onPrepareOptionsMenu(menu);
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
      case CLEAR_MENU_ID:
        adapter.clear();
        break;
      case SETTING_MENU_ID:
        final AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(this);
        final boolean[] bools = this.filter.getBooleanArray();
        alertDialogBuilder.setMultiChoiceItems(
            LogUtil.getLevelStrings(),
            bools,
            new OnMultiChoiceClickListener() {
              @Override
              public void onClick(DialogInterface dialog, int which,
                                  boolean isChecked) {
                bools[which] = isChecked;
              }
            });
        // Set boolean values to filter
        alertDialogBuilder.setPositiveButton(
            "OK",
            new OnClickListener() {
              @Override
              public void onClick(DialogInterface dialog, int which) {
                filter.setBooleanArray(bools);
              }
            });
        // cancel settings
        alertDialogBuilder.setNegativeButton(
            "Cancel",
            new OnClickListener() {
              @Override
              public void onClick(DialogInterface dialog, int which) {
              }
            });

        alertDialogBuilder
            .setTitle("Select Levels")
            .create()
            .show();

        break;
      case PAUSE_MENU_ID:
        adapter.setFilter(new LogFilter() {
            @Override
            public boolean UseLog(Log log) {
              return false;
            }
          });
        Toast.makeText(this, "Paused", Toast.LENGTH_SHORT).show();
        isPaused = true;
        break;
      case RESUME_MENU_ID:
        adapter.setFilter(filter);
        Toast.makeText(this, "Resumed", Toast.LENGTH_SHORT).show();
        isPaused = false;
        break;
      default:
        android.util.Log.e("android_rxconsole", "MenuCase error");
        break;
    }
    return true;
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

  /*
   * from rosjava (src/main/java/org/ros/address/InetAddressFactory.java)
   */
  private Collection<InetAddress> getAllInetAddresses() {
    List<NetworkInterface> networkInterfaces;
    try {
      networkInterfaces = Collections.list(NetworkInterface.getNetworkInterfaces
                                           ());
    } catch (SocketException e) {
      throw new RosRuntimeException(e);
    }
    List<InetAddress> inetAddresses = Lists.newArrayList();
    for (NetworkInterface networkInterface : networkInterfaces) {
      inetAddresses.addAll(Collections.list(networkInterface.getInetAddresses())
                           );
    }
    return inetAddresses;
  }

  /**
   * initialize ROS instances. listView contains subscriber of /rosout_agg
   *
   * @param nodeMainExecutor ROS node
   */
  @Override
  protected void init(NodeMainExecutor nodeMainExecutor) {
    // support of multi ip addressed device
    final List<String> ip_addresses = new ArrayList<String>();
    for (InetAddress address : getAllInetAddresses()) {
      if ((!address.isLoopbackAddress()) &&
          (address.getAddress().length == 4) // ipv4
          ) {
        ip_addresses.add(address.getHostAddress());
      }
    }
    if (ip_addresses.size() > 1) {
      runOnUiThread(new Runnable() {
          public void run() {
            new AlertDialog.Builder(MainActivity.this)
                .setTitle("Select Device IP")
                .setItems(ip_addresses.toArray(new CharSequence[ip_addresses.size()]),
                          new DialogInterface.OnClickListener(){
                            @Override
                            public void onClick(DialogInterface dialog, int which) {

                              hostName = ip_addresses.get(which);
                            }
                          })
                .show();
          }
        });
      while (hostName == null) {
        try {
          Thread.sleep(100);
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
      }
    } else {
      hostName = InetAddressFactory.newNonLoopback().getHostAddress();
    }

    NodeConfiguration nodeConfiguration =
        NodeConfiguration.newPublic(hostName, getMasterUri());

    nodeMainExecutor.execute(listView,
                             nodeConfiguration.setNodeName("android_rxconsole"));
  }
}
