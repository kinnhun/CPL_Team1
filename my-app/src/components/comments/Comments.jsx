import React, { useState, useEffect } from 'react';
import style from './Comment.module.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Comments = () => {
    const { slug } = useParams();

    const [article, setArticle] = useState({});
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [commentBody, setCommentBody] = useState('');
    const [error, setError] = useState(null);
    const [token, setToken] = useState('');
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, []);
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    useEffect(() => {
        // Fetch article details
        fetchArticle();

        // Fetch comments for the article using Axios
        fetchCommentsWithAxios();
    }, [slug]);

    const fetchArticle = () => {
        fetch(`https://api.realworld.io/api/articles/${slug}`)
            .then(response => response.json())
            .then(data => {
                if (!data.article) {
                    throw new Error('Article not found');
                }
                setArticle(data.article);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    };

    const fetchCommentsWithAxios = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.realworld.io/api/articles/${slug}/comments`,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        axios.request(config)
            .then(response => {
                setComments(response.data.comments);
            })
            .catch(error => {
                setError(error.message);
            });
    };

    const handleCommentChange = (e) => {
        setCommentBody(e.target.value);
    };

    const handlePostComment = () => {
        fetch(`https://api.realworld.io/api/articles/${slug}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                comment: {
                    body: commentBody
                }
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to post comment');
                }
                return response.json();
            })
            .then(() => {
                // After posting the comment, fetch the updated comments
                fetchCommentsWithAxios();
                setCommentBody('');
            })
            .catch(error => {
                setError(error.message);
            });
    };

    const handleDeleteComment = (commentId) => {
        fetch(`https://api.realworld.io/api/articles/${slug}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete comment');
                }
                // Filter out the deleted comment
                setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
            })
            .catch(error => {
                setError(error.message);
            });
    };

    return (
        <div className={style.containerCard}>
            <textarea
                placeholder='Write a comment...'
                value={commentBody}
                onChange={handleCommentChange}
            ></textarea>

            <div className={style.cardFooter}>
                <img src={article.author?.image} alt="Author" />
                <button onClick={handlePostComment}>Post Comment</button>
            </div>

            <div className={style.commentsList}>
                {comments && comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className={`card ${style.commentItem}`}>
                            <div className="card-block" style={{ minHeight: '50px' }}>
                                <p className="card-text">{comment.body}</p>
                            </div>

                            <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
            src={comment.author.image}
            alt="Commenter"
            className="comment-author-img"
            style={{ height: '20px', width: '20px', marginRight: '8px' }}
        />

        <a className="comment-author" href={`/profile/${comment.author.username}`}>
            {comment.author.username}
        </a>
        <span className="date-posted" style={{ marginLeft: '8px' }}>{new Date(comment.createdAt).toLocaleString()}</span>
    </div>

    {token && (
        <button className="mod-options" style={{ border: 'none' }} onClick={() => handleDeleteComment(comment.id)}>
            <i className="fa-solid fa-trash"></i>
        </button>
    )}
</div>

                        </div>
                    ))
                ) : (
                    <p>No comments yet.</p>
                )}
            </div>

        </div>
    );
};

export default Comments;
