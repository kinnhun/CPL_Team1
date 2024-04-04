import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import style from './ArticleDetail.module.css';
import { Link } from 'react-router-dom';
import Comment from '../comments/Comments'
const ArticleDetail = () => {


    const { slug } = useParams();
    console.log(slug);
    // ------------------------------------------------------------------
    const [article, setArticle] = useState({});
    const [loading, setLoading] = useState(true);
    const [tags, setTags] = useState([]);
    const [error, setError] = useState(null);
    const [token, setToken] = useState('');
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);
    useEffect(() => {
        fetch(`https://api.realworld.io/api/articles/${slug}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch article');

                }
                return response.json();
            })
            .then(data => {
                setArticle(data.article);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);

            });
    }, []);


    // --------------------------------------------------------------
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
    // -------------------------------------------------------------------------
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const handleFollowClick = () => {
        setIsFollowing(prevState => !prevState);
    };
    const handleFavoriteClick = () => {
        const newFavoritesCount = isFavorited ? article.favoritesCount - 1 : article.favoritesCount + 1;
        setIsFavorited(prevState => !prevState);
        setArticle(prevArticle => ({ ...prevArticle, favoritesCount: newFavoritesCount }));
    };
    // ----------------------------------------------------------------------------------------------
    return (
        <div>
            {
                loading ? (<p>Loading...</p>) : (
                    <div className={style.containerAll}>
                        <div className={style.bannerArticleDetail}>
                            <h1>{article.title}</h1>
                            <div className={style.articleContent}>
                                <div className={style.articleImage}>
                                    <img src={article.author.image} alt="Image" />
                                    <div>
                                        <a href="">{article.author.username}</a>
                                        <span className="date">
                                            {new Date(article.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                </div>
                                <div className={style.articleButton}>
                                    {token ? (
                                        <>
                                            <button className={style.buttonFollow} onClick={handleFollowClick}>
                                                <i className="fa-solid fa-plus"></i> {isFollowing ? 'Unfollow' : 'Follow'} Maksim Esteban
                                            </button>
                                            <button className={style.buttonFavorite} onClick={handleFavoriteClick}>
                                                <i className="fa-solid fa-heart"></i> {isFavorited ? 'Unfavorite' : 'Favorite'} Article ({article.favoritesCount})
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/users/register">
                                                <button className={style.buttonFollow}><i className="fa-solid fa-plus"></i> Follow Maksim Esteban</button>
                                                <button className={style.buttonFavorite}><i className="fa-solid fa-heart"></i> Favorite Article ({article.favoritesCount})</button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={style.containerArticleDetail}>
                            <p className={style.containerDescription}>{article.description}</p>
                            <p>{article.body}</p>
                        </div>
                        <ul className={style.tagList}>
                            {article.tagList.map(tag => (
                                <li key={tag} className={style.tagItem}>{tag}</li>
                            ))}
                        </ul>

                        <div className={`d-flex justify-content-center align-items-center`}>
                            {token ? (
                                <Comment></Comment>
                            ) : (
                                <div className={`d-flex flex-column align-items-center ${style.linkSign}`}>
                                    <>
                                        <Link to="/users/login" className="btn btn-primary">Sign In</Link>
                                        <span className="mx-2">or</span>
                                        <Link to="/users/register" className="btn btn-secondary">Sign Up</Link>
                                        <span>to add comments on this article</span>
                                    </>
                                </div>
                            )}
                        </div>

                    </div>
                )

            }


        </div>
    );
};

export default ArticleDetail;