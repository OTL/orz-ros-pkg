package com.ogutti.ros.android.console;

// view can not be updated by other thread.
// most simple way is make the view as a node.

import org.ros.message.MessageListener;
import org.ros.namespace.GraphName;
import org.ros.node.ConnectedNode;
import org.ros.node.Node;
import org.ros.node.NodeMain;
import org.ros.node.topic.Subscriber;

import android.util.Log;
import android.content.Context;
import android.util.AttributeSet;
import android.widget.ArrayAdapter;
import android.widget.ListAdapter;
import android.widget.ListView;

public class RosListView<T> extends ListView implements NodeMain {

  private String topicName;
  private String messageType;
  //private ArrayAdapter<T> adapter;

  public RosListView(Context context) {
    super(context);
  }

  public RosListView(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  public RosListView(Context context, AttributeSet attrs, int defStyle) {
    super(context, attrs, defStyle);
  }

  public void setTopicName(String topicName) {
    this.topicName = topicName;
  }

  public void setMessageType(String messageType) {
    this.messageType = messageType;
  }

  @Override
  public GraphName getDefaultNodeName() {
    return new GraphName("android_console/ros_list_view");
  }

  @Override
  public void onStart(ConnectedNode connectedNode) {
    final ArrayAdapter<T> arrayAdapter = (ArrayAdapter<T>)getAdapter();
    Subscriber<T> subscriber =
        connectedNode.newSubscriber(topicName, messageType);
    subscriber.addMessageListener(new MessageListener<T>() {
      @Override
      public void onNewMessage(final T message) {
        if (arrayAdapter != null) {
          post(new Runnable() {
            @Override
            public void run() {
              arrayAdapter.add(message);
            }
            });
          postInvalidate();
        }
      }});
  }

  @Override
  public void onShutdown(Node node) {
  }

  @Override
  public void onShutdownComplete(Node node) {
  }

  @Override
  public void onError(Node node, Throwable throwable) {
  }
}