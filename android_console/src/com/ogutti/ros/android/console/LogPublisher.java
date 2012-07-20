package com.ogutti.ros.android.console;
import org.ros.concurrent.CancellableLoop;
import org.ros.namespace.GraphName;
import org.ros.node.AbstractNodeMain;
import org.ros.node.ConnectedNode;
import org.ros.node.topic.Publisher;

public class LogPublisher extends AbstractNodeMain {

  @Override
  public GraphName getDefaultNodeName() {
    return new GraphName("log_talkler");
  }

  @Override
  public void onStart(final ConnectedNode connectedNode) {
    final Publisher<rosgraph_msgs.Log> publisher =
        connectedNode.newPublisher("rosout_agg", rosgraph_msgs.Log._TYPE);
    // This CancellableLoop will be canceled automatically when the node shuts
    // down.
    connectedNode.executeCancellableLoop(new CancellableLoop() {
      private int sequenceNumber;

      @Override
      protected void setup() {
        sequenceNumber = 0;
      }

      @Override
      protected void loop() throws InterruptedException {
        rosgraph_msgs.Log log = publisher.newMessage();
        if (sequenceNumber % 3 == 0) {
          log.setLevel(rosgraph_msgs.Log.ERROR);
        } else if (sequenceNumber % 3 == 1) {
          log.setLevel(rosgraph_msgs.Log.WARN);
        } else {
          log.setLevel(rosgraph_msgs.Log.INFO);
        }
        log.setMsg("hoge" + sequenceNumber);
        publisher.publish(log);
        sequenceNumber++;
        Thread.sleep(1000);
      }
    });
  }
}