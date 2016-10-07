import React, { PropTypes } from 'react';
import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HTMLView from '../../components/HTMLView';
import styles from './styles';

const Post = ({ post, floor }) => (
  <View style={styles.post}>
    <Text style={styles.floor}>{floor === 0 ? '原' : `${floor}F`}</Text>
    <View style={styles.postInfo}>
      <View style={styles.postIconContainer}>
        <Icon name="account-circle" size={64} color="#000" />
      </View>
      <View style={styles.postInfoContent}>
        <View style={styles.postInfoFirstLine}>
          <Text style={styles.postInfoName}>{post.name}</Text>
          <Text style={styles.postInfoId}>({post.account})</Text>
        </View>
        <Text style={styles.postInfoEmail}>{post.email}</Text>
        <Text style={styles.postInfoTime}>{post.date}</Text>
      </View>
    </View>
    <View style={styles.postContentContainer}>
      <HTMLView html={post.content} />
    </View>
  </View>
);

Post.propTypes = {
  post: PropTypes.shape({
    name: PropTypes.string,
    account: PropTypes.string,
    email: PropTypes.string,
    date: PropTypes.string,
  }),
  floor: PropTypes.number,
};

export default Post;

