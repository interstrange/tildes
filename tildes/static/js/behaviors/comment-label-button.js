// Copyright (c) 2018 Tildes contributors <code@tildes.net>
// SPDX-License-Identifier: AGPL-3.0-or-later

$.onmount('[data-js-comment-label-button]', function() {
    $(this).click(function(event) {
        event.preventDefault();

        var $comment = $(this).parents('.comment').first();
        var userLabels = $comment.attr('data-comment-user-labels');

        // check if the label button div already exists and just remove it if so
        $labelButtons = $comment.find('.comment-itself:first').find('.comment-label-buttons');
        if ($labelButtons.length > 0) {
            $labelButtons.remove();
            return;
        }

        var commentID = $comment.attr('data-comment-id36');
        var labelURL = '/api/web/comments/' + commentID + '/labels/';

        var labeltemplate = document.querySelector('#comment-label-options');
        var clone = document.importNode(labeltemplate.content, true);
        var options = clone.querySelectorAll('a');

        for (i = 0; i < options.length; i++) {
            var label = options[i];
            var labelName = label.textContent;

            var labelOptionActive = false;
            if (userLabels.indexOf(labelName) !== -1) {
                labelOptionActive = true;
            }

            var labelPrompt = label.getAttribute("data-js-reason-prompt");

            if (labelOptionActive) {
                label.className += " btn btn-used";
                label.setAttribute('data-ic-delete-from', labelURL + labelName);

                // if the label requires a prompt, confirm that they want to remove it
                // (since we don't want to accidentally lose the reason they typed in)
                if (labelPrompt) {
                    label.setAttribute("data-ic-confirm", "Remove your "+labelName+" label?");
                }

                $(label).on('after.success.ic', function(evt) {
                    Tildes.removeUserLabel(commentID, evt.target.textContent);
                });
            } else {
                label.setAttribute('data-ic-put-to', labelURL + labelName);

                if (labelPrompt) {
                    label.setAttribute("data-ic-prompt", labelPrompt);
                    label.setAttribute("data-ic-prompt-name", "reason");
                }

                $(label).on('after.success.ic', function(evt) {
                    Tildes.addUserLabel(commentID, evt.target.textContent);
                });
            }

            label.setAttribute('data-ic-target', '#comment-' + commentID + ' .comment-itself:first');
        }

        // update Intercooler so it knows about these new elements
        Intercooler.processNodes(clone);

        $comment.find(".post-buttons").first().after(clone);
    });
});

Tildes.removeUserLabel = function(commentID, labelName) {
    $comment = $("#comment-" + commentID);
    var userLabels = $comment.attr('data-comment-user-labels').split(" ");

    // if the label isn't there, don't need to do anything
    labelIndex = userLabels.indexOf(labelName);
    if (labelIndex === -1) {
        return;
    }

    // remove the label from the list and update the data attr
    userLabels.splice(labelIndex, 1);
    $comment.attr('data-comment-user-labels', userLabels.join(" "));
}

Tildes.addUserLabel = function(commentID, labelName) {
    $comment = $("#comment-" + commentID);
    var userLabels = $comment.attr('data-comment-user-labels').split(" ");

    // don't add the label again if it's already there
    labelIndex = userLabels.indexOf(labelName);
    if (labelIndex !== -1) {
        return;
    }

    // add the label to the list and update the data attr
    userLabels.push(labelName);
    $comment.attr('data-comment-user-labels', userLabels.join(" "));
}