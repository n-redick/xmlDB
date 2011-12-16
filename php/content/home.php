
<link href="forum.css" rel="stylesheet" />

<?php
	include('php/func_forum.php');
	
	$g_content = '
		<table cellpadding="0" cellspacing="0" class="ne_table">
			<colgroup>
				<col width="536px" />
				<col width="404px" />
			</colgroup>
			<tr>
				<td valign="top"><div class="ne_p">';
	$news = forum_get_topics(NEWS_FORUM,1);
	for( $i = 0 ; $i < min(count($news),5) ; $i++ )
	{
		$g_content .=
			'
			<div class="ne_title'. ($i!=0 ? '_old' : '' ) .'">'.$news[$i]['title'].'</div>
			<div class="ne_header">
					By <span class="'
						.$user_role_to_css_class[$news[$i]['creatorRole']].'">'.$news[$i]['creator'].
					'</span> posted '.
					date("M jS Y \a\\t  g:i A",(int)$news[$i]['created'])
				.'
			</div>
			
			<div class="ne_content'. ($i!=0 ? ' ne_content_old' : '' ) .'">
			'.($i==0?$news[$i]['content']:shorten($news[$i]['content_plain'],100).'&nbsp<a class="ne_read_more" href="?topic='.(int)$news[$i]['topicId'].'">read more</a>').'
			</div>
			<div class="ne_cl'.($i!=0 ? ' ne_cl_old' : '' ).'">
				<a class="fo_comment_link" href="?topic='.(int)$news[$i]['topicId'].'">'.(($news[$i]['posts']-1)<=0?'No Comments':($news[$i]['posts']-1).' Comments').'</a>
			</div>';
	}
	if( 0 == count($news) )
	{
		$g_content .= '<h6>No news found!</h6>';
	}
	$g_content .= '
				</div></td>
				<td valign="top">
					<div class="fo_recent_p">
				
				
					<div class="fo_recent_title">Recent forum posts</div>';

	$new = forum_get_new_posts( 10, array(4) );
	
	for( $i = 0 ; $i < count($new) ; $i++ )
	{
		$g_content .= '
					<div class="fo_recent' . ( $i == (count($new)-1) ? '_last' : '' ) . ( $i % 2 == 0 ? " fo_cell_bg1" : " fo_cell_bg2" ) . '">
						<div class="forum_time"><span class="'.$user_role_to_css_class[$new[$i]['role']].'">'.
								$new[$i]['name'].
							'</span> '.
							date("M jS Y g:i A",(int)$new[$i]['created']).
							' in <a class="fo_header_subforum_link" href="?forum=' . $new[$i]['forumId'] . '">'.
							shorten($new[$i]['forum'], 20).
							'<a>'.
							'</div>
						<div>'.forum_topic_link( $new[$i]['flag'], $new[$i]['locked'], $new[$i]['topicId'], $new[$i]['title'], $new[$i]['posts'], $new[$i]['page'], 60 ).'</div>
					</div>';
	}
	$g_content .= '
					</div>
				</td>
			</tr>
		</table>';
?>
								
							